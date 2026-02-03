const Incident = require("../Model/IncidentModel");

// Get all incidents with pagination and filtering
const getAllIncidents = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, incidentType, priority } = req.query;
        
        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (incidentType) filter.incidentType = incidentType;
        if (priority) filter.priority = priority;

        const incidents = await Incident.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Incident.countDocuments(filter);

        res.status(200).json({
            incidents,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching incidents", error: err.message });
    }
};

// Get incident by ID
const getIncidentById = async (req, res) => {
    try {
        const { id } = req.params;
        const incident = await Incident.findById(id);
        
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }
        
        res.status(200).json({ incident });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching incident", error: err.message });
    }
};

// Create new incident
const createIncident = async (req, res) => {
    try {
        const {
            callerName,
            callerPhone,
            address,
            coordinates,
            incidentType,
            hazards,
            peopleTrapped,
            injured,
            crowdSize,
            emergencyScale,
            liveNotes,
            priority,
            safetyAdvice
        } = req.body;

        // Validate required fields
        if (!callerName || !callerPhone || !address || !incidentType) {
            return res.status(400).json({ 
                message: "Missing required fields: callerName, callerPhone, address, incidentType" 
            });
        }

        const incident = new Incident({
            callerName,
            callerPhone,
            address,
            coordinates,
            incidentType,
            hazards: hazards || [],
            peopleTrapped: peopleTrapped || 0,
            injured: injured || 0,
            crowdSize: crowdSize || 'Small',
            emergencyScale: emergencyScale || 'Medium',
            liveNotes: liveNotes || '',
            priority: priority || 'Medium',
            safetyAdvice: safetyAdvice || []
        });

        await incident.save();
        res.status(201).json({ 
            message: "Incident created successfully", 
            incident 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating incident", error: err.message });
    }
};

// Update incident
const updateIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Remove fields that shouldn't be updated
        delete updateData.callId;
        delete updateData.createdAt;
        
        const incident = await Incident.findByIdAndUpdate(
            id, 
            { ...updateData, updatedAt: Date.now() }, 
            { new: true, runValidators: true }
        );
        
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }
        
        res.status(200).json({ 
            message: "Incident updated successfully", 
            incident 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating incident", error: err.message });
    }
};

// Delete incident
const deleteIncident = async (req, res) => {
    try {
        const { id } = req.params;
        const incident = await Incident.findByIdAndDelete(id);
        
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }
        
        res.status(200).json({ message: "Incident deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error deleting incident", error: err.message });
    }
};

// Update incident status
const updateIncidentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, operatorNotes } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }
        
        const updateData = { status, updatedAt: Date.now() };
        
        if (status === 'Resolved' || status === 'Closed') {
            updateData.resolvedAt = Date.now();
        }
        
        if (status === 'Dispatched') {
            updateData.dispatchTime = Date.now();
        }
        
        if (operatorNotes) {
            updateData.operatorNotes = operatorNotes;
        }
        
        const incident = await Incident.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }
        
        res.status(200).json({ 
            message: "Incident status updated successfully", 
            incident 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating incident status", error: err.message });
    }
};

// Get incident statistics
const getIncidentStats = async (req, res) => {
    try {
        const stats = await Incident.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
                    dispatched: { $sum: { $cond: [{ $eq: ['$status', 'Dispatched'] }, 1, 0] } },
                    resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
                    closed: { $sum: { $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0] } }
                }
            }
        ]);
        
        const typeStats = await Incident.aggregate([
            {
                $group: {
                    _id: '$incidentType',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const priorityStats = await Incident.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.status(200).json({
            overall: stats[0] || { total: 0, active: 0, dispatched: 0, resolved: 0, closed: 0 },
            byType: typeStats,
            byPriority: priorityStats
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching statistics", error: err.message });
    }
};

// Search incidents
const searchIncidents = async (req, res) => {
    try {
        const { q, status, incidentType, priority, startDate, endDate } = req.query;
        
        const filter = {};
        
        if (q) {
            filter.$or = [
                { callerName: { $regex: q, $options: 'i' } },
                { address: { $regex: q, $options: 'i' } },
                { callId: { $regex: q, $options: 'i' } }
            ];
        }
        
        if (status) filter.status = status;
        if (incidentType) filter.incidentType = incidentType;
        if (priority) filter.priority = priority;
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        
        const incidents = await Incident.find(filter).sort({ createdAt: -1 });
        
        res.status(200).json({ incidents, total: incidents.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error searching incidents", error: err.message });
    }
};

module.exports = {
    getAllIncidents,
    getIncidentById,
    createIncident,
    updateIncident,
    deleteIncident,
    updateIncidentStatus,
    getIncidentStats,
    searchIncidents
};
