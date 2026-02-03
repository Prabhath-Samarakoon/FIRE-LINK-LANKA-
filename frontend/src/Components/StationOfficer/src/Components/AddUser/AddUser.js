import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

function AddUser() {
  const history = useNavigate();
  const [inputs,setInputs] = useState({
    name:"",
    gmail:"",
    address:"",
  })
  const handleChange = (e) => {
    setInputs({...inputs,[e.target.name]:e.target.value})
  }
  const handleSubmit = (e) => {
    e.preventDefault();   
    console.log('Submitting user:', inputs)
    sendRequest().then(()=>history('/user-details'))
  }

  const sendRequest = async () => {
    await axios.post("/api/users",{
      name:String(inputs.name),
      gmail:String(inputs.gmail),
      address:String(inputs.address),
    })
    .then((res)=>console.log(res))
    .catch((err)=>console.log(err))
  }
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      <h1>Add User</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '6px' }}>Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={inputs.name}
            onChange={handleChange}
            placeholder="Enter name"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="gmail" style={{ display: 'block', marginBottom: '6px' }}>Gmail</label>
          <input
            id="gmail"
            name="gmail"
            type="email"
            value={inputs.gmail}
            onChange={handleChange}
            placeholder="example@gmail.com"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '6px' }}>Address</label>
          <textarea
            id="address"
            name="address"
            value={inputs.address}
            onChange={handleChange}
            placeholder="Enter address"
            rows={4}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 16px' }}>Submit</button>
      </form>
    </div>
  )
}

export default AddUser
