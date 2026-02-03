import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Logo from '../../../assets/Logo.jpg'
// Tailwind styles applied via className
import jsPDF from 'jspdf'

const API_BASE = process.env.REACT_APP_STAFF_API_URL || 'http://localhost:5000'

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const navigate = useNavigate()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleQuickActions = () => {
    setShowQuick(prev => !prev)
  }

  const fmtDate = (val) => {
    if (!val) return ''
    const d = new Date(val)
    return isNaN(d.getTime()) ? String(val) : d.toISOString().slice(0, 10)
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'onduty':
        return 'On Duty'
      case 'resting':
        return 'Resting'
      default:
        return 'Available'
    }
  }

  const generatePdf = (title, columns, rows, filename) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 48

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(title, pageWidth / 2, y, { align: 'center' })
    y += 24

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    const colX = [48]
    const colWidths = []
    const totalCols = columns.length
    const usableWidth = pageWidth - 96
    const widthEach = Math.floor(usableWidth / totalCols)

    for (let i = 0; i < totalCols; i++) {
      colWidths.push(widthEach)
      if (i > 0) colX.push(colX[i - 1] + colWidths[i - 1])
    }

    columns.forEach((col, i) => {
      doc.text(String(col), colX[i] + 4, y)
    })
    y += 12
    doc.setLineWidth(0.5)
    doc.line(48, y, pageWidth - 48, y)
    y += 10

    doc.setFont('helvetica', 'normal')
    rows.forEach((row) => {
      row.forEach((cell, i) => {
        const text = String(cell ?? '')
        const maxWidth = colWidths[i] - 8
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, colX[i] + 4, y)
      })
      const rowHeights = row.map((cell, i) => {
        const lines = doc.splitTextToSize(String(cell ?? ''), colWidths[i] - 8)
        return Math.max(12, lines.length * 12)
      })
      const rowHeight = Math.max(16, ...rowHeights)
      y += rowHeight

      if (y > doc.internal.pageSize.getHeight() - 72) {
        doc.addPage()
        y = 48
      }
    })

    doc.save(filename)
  }

  const fetchJson = async (path) => {
    const mkUrl = (base) => `${base}${path.startsWith('/') ? path : `/${path}`}`
    const primary = mkUrl(API_BASE)
    try {
      const res = await fetch(primary, { mode: 'cors', cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
      if (!res.ok) throw new Error(`Failed to fetch ${primary}: ${res.status}`)
      return await res.json()
    } catch (err) {
      // Fallback to 127.0.0.1 if localhost fails
      if (API_BASE.includes('localhost')) {
        const fb = mkUrl(API_BASE.replace('localhost', '127.0.0.1'))
        const res2 = await fetch(fb, { mode: 'cors', cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
        if (!res2.ok) throw new Error(`Failed to fetch ${fb}: ${res2.status}`)
        return await res2.json()
      }
      throw err
    }
  }

  const fetchFirstAvailable = async (paths) => {
    let lastError
    for (const p of paths) {
      try {
        const data = await fetchJson(p)
        return data
      } catch (e) {
        lastError = e
      }
    }
    throw lastError || new Error('No endpoints responded')
  }

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.data)) return payload.data
    if (payload && Array.isArray(payload.items)) return payload.items
    if (payload && Array.isArray(payload.Users)) return payload.Users
    if (payload && Array.isArray(payload.users)) return payload.users
    if (payload && Array.isArray(payload.trainings)) return payload.trainings
    if (payload && Array.isArray(payload.schedules)) return payload.schedules
    if (payload && Array.isArray(payload.result)) return payload.result
    if (payload && Array.isArray(payload.records)) return payload.records
    return payload ? [payload] : []
  }

  const ensureRowsOrWarn = (rows, rawSample, label) => {
    if (!rows || rows.length === 0) {
      alert(`${label}: No data found to include in PDF. Please verify the API returns records. Sample: ` + (rawSample ? JSON.stringify(rawSample).slice(0, 200) : 'empty'))
    }
  }

  const buildUserMap = async () => {
    try {
      const usersPayload = await fetchFirstAvailable(['/Users', '/users', '/api/users'])
      const users = normalizeArray(usersPayload)
      const map = new Map()
      users.forEach(u => {
        const id = u._id ?? u.id ?? u.userId ?? u.staffId
        if (id != null) {
          const name = u.name ?? u.fullName ?? [u.firstName, u.lastName].filter(Boolean).join(' ') ?? ''
          map.set(String(id), {
            name,
            email: u.gmail ?? u.email ?? ''
          })
        }
      })
      return map
    } catch (_) {
      return new Map()
    }
  }

  const resolveStaffName = (record, userMap) => {
    if (record.user && (record.user.name || record.user.fullName)) {
      return record.user.name ?? record.user.fullName
    }

    if (Array.isArray(record.assignedTo)) {
      return record.assignedTo.join(', ')
    }

    const id = record.userId ?? record.assignedTo ?? record.staffId ?? record.employeeId
    if (id != null) {
      const hit = userMap.get(String(id))
      if (hit && hit.name) return hit.name
    }
    return record.userName ?? record.staffName ?? record.name ?? ''
  }

  const downloadStaffDetails = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      // Fetch staff data from the API
      const response = await fetch(`${API_BASE}/Users`)
      if (!response.ok) {
        throw new Error('Failed to fetch staff data')
      }
      const data = await response.json()
      const staff = data.data || data.Users || data.users || []
      
      // Generate PDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let y = 20
      
      // Title
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Staff Details Report', pageWidth / 2, y, { align: 'center' })
      y += 20
      
      // Date
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' })
      y += 20
      
      // Table headers
      const headers = ['Name', 'Email', 'Age', 'Position', 'Address']
      const colWidths = [40, 50, 20, 30, 50]
      let x = 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      headers.forEach((header, i) => {
        doc.text(header, x, y)
        x += colWidths[i]
      })
      y += 10
      
      // Table data
      doc.setFont('helvetica', 'normal')
      staff.forEach((member) => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        x = 10
        const rowData = [
          member.name || 'N/A',
          member.gmail || 'N/A',
          member.age || 'N/A',
          member.position || 'Unassigned',
          member.address || 'N/A'
        ]
        rowData.forEach((cell, i) => {
          doc.text(String(cell).substring(0, 25), x, y)
          x += colWidths[i]
        })
        y += 8
      })
      
      // Save the PDF
      doc.save('staff-details.pdf')
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloading(false)
      setShowQuick(false)
    }
  }

  const downloadTraining = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      // Fetch training data from the API
      const response = await fetch(`${API_BASE}/trainings`)
      if (!response.ok) {
        throw new Error('Failed to fetch training data')
      }
      const data = await response.json()
      const trainings = data.data || data.trainings || data || []
      
      // Generate PDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let y = 20
      
      // Title
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Training Report', pageWidth / 2, y, { align: 'center' })
      y += 20
      
      // Date
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' })
      y += 20
      
      // Table headers
      const headers = ['Type', 'Part', 'Level', 'Status', 'Assigned To']
      const colWidths = [30, 40, 25, 25, 50]
      let x = 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      headers.forEach((header, i) => {
        doc.text(header, x, y)
        x += colWidths[i]
      })
      y += 10
      
      // Table data
      doc.setFont('helvetica', 'normal')
      trainings.forEach((training) => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        x = 10
        const rowData = [
          training.type || 'N/A',
          training.part || 'N/A',
          training.level || 'N/A',
          training.status || 'N/A',
          Array.isArray(training.assignedTo) ? training.assignedTo.join(', ') : (training.assignedTo || 'N/A')
        ]
        rowData.forEach((cell, i) => {
          doc.text(String(cell).substring(0, 20), x, y)
          x += colWidths[i]
        })
        y += 8
      })
      
      // Save the PDF
      doc.save('training.pdf')
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloading(false)
      setShowQuick(false)
    }
  }

  const downloadSchedules = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      // Fetch schedules data from the API
      const response = await fetch(`${API_BASE}/schedules`)
      if (!response.ok) {
        throw new Error('Failed to fetch schedules data')
      }
      const data = await response.json()
      const schedules = data.data || data.schedules || data || []
      
      // Generate PDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let y = 20
      
      // Title
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Schedules Report', pageWidth / 2, y, { align: 'center' })
      y += 20
      
      // Date
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' })
      y += 20
      
      // Table headers
      const headers = ['Date', 'Start Time', 'End Time', 'Shift Type', 'Position', 'Notes']
      const colWidths = [30, 25, 25, 25, 30, 35]
      let x = 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      headers.forEach((header, i) => {
        doc.text(header, x, y)
        x += colWidths[i]
      })
      y += 10
      
      // Table data
      doc.setFont('helvetica', 'normal')
      schedules.forEach((schedule) => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        x = 10
        const rowData = [
          schedule.date ? new Date(schedule.date).toLocaleDateString() : 'N/A',
          schedule.startTime || 'N/A',
          schedule.endTime || 'N/A',
          schedule.shiftType || 'N/A',
          schedule.position || 'N/A',
          schedule.notes || 'N/A'
        ]
        rowData.forEach((cell, i) => {
          doc.text(String(cell).substring(0, 15), x, y)
          x += colWidths[i]
        })
        y += 8
      })
      
      // Save the PDF
      doc.save('schedules.pdf')
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloading(false)
      setShowQuick(false)
    }
  }

  const downloadAvailability = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      // Fetch staff and availability data from the API
      const [staffRes, availRes] = await Promise.all([
        fetch(`${API_BASE}/Users`),
        fetch(`${API_BASE}/availability`)
      ])
      
      if (!staffRes.ok) {
        throw new Error('Failed to fetch staff data')
      }
      
      const staffData = await staffRes.json()
      const staff = staffData.data || staffData.Users || staffData.users || []
      
      const availabilityData = availRes.ok ? await availRes.json() : { availability: [] }
      const availability = availabilityData.availability || []
      
      // Create availability map
      const availabilityMap = new Map()
      availability.forEach(record => {
        const id = record.userId && (record.userId._id || record.userId)
        if (id) availabilityMap.set(id, record.status)
      })
      
      // Generate PDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let y = 20
      
      // Title
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Staff Availability Report', pageWidth / 2, y, { align: 'center' })
      y += 20
      
      // Date
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' })
      y += 20
      
      // Table headers
      const headers = ['Name', 'Age', 'Position', 'Status']
      const colWidths = [50, 20, 40, 30]
      let x = 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      headers.forEach((header, i) => {
        doc.text(header, x, y)
        x += colWidths[i]
      })
      y += 10
      
      // Table data
      doc.setFont('helvetica', 'normal')
      staff.forEach((member) => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        x = 10
        const status = availabilityMap.get(member._id) || 'available'
        const statusText = status === 'available' ? 'Available' : 
                          status === 'onduty' ? 'On Duty' : 
                          status === 'resting' ? 'Resting' : 'Available'
        
        const rowData = [
          member.name || 'N/A',
          member.age || 'N/A',
          member.position || 'Unassigned',
          statusText
        ]
        rowData.forEach((cell, i) => {
          doc.text(String(cell).substring(0, 20), x, y)
          x += colWidths[i]
        })
        y += 8
      })
      
      // Save the PDF
      doc.save('availability.pdf')
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setDownloading(false)
      setShowQuick(false)
    }
  }

  const downloadPayments = async () => {
    if (downloading) return
    setDownloading(true)
    try {
      // Fetch payment data from the API
      const response = await fetch(`${API_BASE}/api/payments`)
      if (!response.ok) {
        throw new Error('Failed to fetch payment data')
      }
      const data = await response.json()
      const payments = data.data?.payments || data.data || data.payments || []
      
      if (payments.length === 0) {
        alert('No payment data available to download')
        return
      }

      // Calculate totals for summary
      const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      const totalPayments = payments.length
      const pendingCount = payments.filter(p => p.status === 'pending').length
      const approvedCount = payments.filter(p => p.status === 'approved').length
      const paidCount = payments.filter(p => p.status === 'paid').length

      // Generate PDF
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      let y = 20
      
      // Title
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('FIRE BRIGADE MANAGEMENT SYSTEM', pageWidth / 2, y, { align: 'center' })
      y += 10
      doc.setFontSize(16)
      doc.text('Payment Details Report', pageWidth / 2, y, { align: 'center' })
      y += 20
      
      // Date and summary
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, y, { align: 'center' })
      y += 10
      doc.text(`Total Records: ${totalPayments}`, pageWidth / 2, y, { align: 'center' })
      y += 20
      
      // Summary section
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('Summary:', 20, y)
      y += 15
      
      doc.setFont('helvetica', 'normal')
      doc.text(`Total Amount: LKR ${totalAmount.toLocaleString()}`, 20, y)
      y += 10
      doc.text(`Total Payments: ${totalPayments}`, 20, y)
      y += 10
      doc.text(`Status Breakdown: Pending: ${pendingCount}, Approved: ${approvedCount}, Paid: ${paidCount}`, 20, y)
      y += 20
      
      // Table headers
      const headers = ['Staff Member', 'Payment Type', 'Amount', 'Currency', 'Payment Date', 'Status', 'Payment Method']
      const colWidths = [35, 25, 20, 15, 25, 20, 25]
      let x = 10
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      headers.forEach((header, i) => {
        doc.text(header, x, y)
        x += colWidths[i]
      })
      y += 8
      
      // Draw line under headers
      doc.setLineWidth(0.5)
      doc.line(10, y, pageWidth - 10, y)
      y += 5
      
      // Table data
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      payments.forEach((payment) => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        x = 10
        const rowData = [
          payment.staffName || 'N/A',
          payment.paymentType || 'N/A',
          payment.amount ? payment.amount.toLocaleString() : '0',
          payment.currency || 'LKR',
          payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A',
          payment.status || 'N/A',
          payment.paymentMethod || 'N/A'
        ]
        rowData.forEach((cell, i) => {
          doc.text(String(cell).substring(0, 15), x, y)
          x += colWidths[i]
        })
        y += 6
      })
      
      // Footer
      y += 20
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('This report was generated automatically by the Fire Brigade Management System', pageWidth / 2, y, { align: 'center' })
      y += 5
      doc.text('For any queries, please contact the system administrator', pageWidth / 2, y, { align: 'center' })
      
      // Save the PDF
      const fileDate = new Date().toISOString().split('T')[0]
      doc.save(`payment_details_${fileDate}.pdf`)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download payment details: ' + error.message)
    } finally {
      setDownloading(false)
      setShowQuick(false)
    }
  }

  const goToEmergency = () => {
    setShowQuick(false)
    navigate('/staff-manager/emergency')
  }

  return (
    <div 
      className="staff-sidebar sticky left-0 top-0 flex h-screen flex-col border-r border-blue-200 bg-white shadow-lg transition-all"
      style={{ width: isCollapsed ? '80px' : '288px' }}
    >
      <div className="flex items-center justify-between border-b border-blue-200 bg-white backdrop-blur-sm px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="h-12 w-12 overflow-hidden rounded-md border border-blue-200">
            <img src={Logo} alt="Logo" className="h-full w-full object-cover" />
          </div>
          {!isCollapsed && (
            <div className="text-lg font-bold tracking-wide text-gray-800">FIRE BRIGADE</div>
          )}
        </div>
        <button className="rounded-md border border-blue-300 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2 overflow-y-auto">
        <NavLink to="/staff-manager" end className={({ isActive }) => `${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'} flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 no-underline`}>
          <div className="text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
          </div>
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>
        
        <NavLink to="/staff-manager/staffdetails" className={({ isActive }) => `${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'} flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 no-underline`}>
          <div className="text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.33 0-8 1.34-7 3.5V19h14v-2.5c0-2.33-5.33-3.5-7-3.5z"/>
            </svg>
          </div>
          {!isCollapsed && <span>Staff Details</span>}
        </NavLink>
        <NavLink to="/staff-manager/training" className={({ isActive }) => `${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'} flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 no-underline`}>
          <div className="text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          {!isCollapsed && <span>Training</span>}
        </NavLink>
        <NavLink to="/staff-manager/schedules" className={({ isActive }) => `${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'} flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 no-underline`}>
          <div className="text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
          {!isCollapsed && <span>Schedules</span>}
        </NavLink>
        <NavLink to="/staff-manager/team" className={({ isActive }) => `${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'} flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 no-underline`}>
          <div className="text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          {!isCollapsed && <span>Our Team</span>}
        </NavLink>
        <NavLink to="/staff-manager/availability" className={({ isActive }) => `${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'} flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 no-underline`}>
          <div className="text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          {!isCollapsed && <span>Availability</span>}
        </NavLink>
        <NavLink to="/staff-manager/payments" className={({ isActive }) => `${isActive ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'} flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 no-underline`}>
          <div className="text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          {!isCollapsed && <span>Payments</span>}
        </NavLink>

        <NavLink to="/staff-manager/emergency-staff" className={({ isActive }) => `${isActive ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md' : 'text-red-600 hover:bg-red-50 hover:text-red-700'} flex items-center gap-3 rounded-md px-3 py-2 transition-all duration-200 no-underline`}>
          <div className="text-red-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          {!isCollapsed && <span>Emergency Staff</span>}
        </NavLink>

        <NavLink to="/" end className={`mt-auto ${isCollapsed ? 'justify-center' : ''} flex items-center gap-3 rounded-md border border-blue-200 px-3 py-2 text-gray-700 hover:bg-blue-50 transition-colors duration-200 no-underline`}>
          <div className="text-blue-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          {!isCollapsed && <span>Main Menu</span>}
        </NavLink>
      </nav>

      <div className="border-t border-blue-200 p-2 bg-white/60 backdrop-blur-sm">
        <button className="w-full rounded-md border border-blue-300 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 text-sm mb-2 shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200" onClick={toggleQuickActions} aria-label="Quick Actions">
          ⚡ Quick Actions
        </button>
        {showQuick && (
          <div className="space-y-1">
            <button className={`w-full rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1.5 text-left text-xs transition-colors duration-200 ${downloading ? 'opacity-60' : ''}`} onClick={downloadStaffDetails} disabled={downloading}>
              📄 {!isCollapsed && 'Staff Details'}
            </button>
            <button className={`w-full rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1.5 text-left text-xs transition-colors duration-200 ${downloading ? 'opacity-60' : ''}`} onClick={downloadTraining} disabled={downloading}>
              🎓 {!isCollapsed && 'Training'}
            </button>
            <button className={`w-full rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1.5 text-left text-xs transition-colors duration-200 ${downloading ? 'opacity-60' : ''}`} onClick={downloadSchedules} disabled={downloading}>
              📅 {!isCollapsed && 'Schedules'}
            </button>
            <button className={`w-full rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1.5 text-left text-xs transition-colors duration-200 ${downloading ? 'opacity-60' : ''}`} onClick={downloadAvailability} disabled={downloading}>
              👥 {!isCollapsed && 'Availability'}
            </button>
            <button className={`w-full rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1.5 text-left text-xs transition-colors duration-200 ${downloading ? 'opacity-60' : ''}`} onClick={downloadPayments} disabled={downloading}>
              💰 {!isCollapsed && 'Payments'}
            </button>
            <button className="w-full rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1.5 text-left text-xs transition-colors duration-200" onClick={goToEmergency}>
              🚨 {!isCollapsed && 'Emergency Mode'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
