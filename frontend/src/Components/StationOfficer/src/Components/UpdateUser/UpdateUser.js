import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

function UpdateUser() {

const [inputs, setInputs] = useState({ name: '', gmail: '', address: '' });
const history = useNavigate();
const id = useParams().id;


useEffect(()=>{
    const fetchHandler = async()=>{
        try{
            const response = await axios.get(`http://localhost:5000/api/users/${id}`);
            const data = response?.data || {};
            const user = data?.user || data || {};
            setInputs((prev)=>({
                name: '',
                gmail: '',
                address: '',
                ...prev,
                ...user,
            }));
        }catch(err){
            console.log(err);
            // keep safe defaults if fetch fails
            setInputs((prev)=>({ name: prev?.name || '', gmail: prev?.gmail || '', address: prev?.address || '' }));
        }
    };
    fetchHandler();
},[id]);

const sendRequest = async()=>{
    await axios.put(`http://localhost:5000/api/users/${id}`,{
        name: String(inputs?.name ?? ''),
        gmail: String(inputs?.gmail ?? ''),
        address: String(inputs?.address ?? ''),
    })
    .then((res)=>console.log(res))
    .catch((err)=>console.log(err));
}
const handleChange = (e) => {
    setInputs({...inputs,[e.target.name]:e.target.value})
  }
  const handleSubmit = (e) => {
    e.preventDefault();   
    console.log('Submitting user:', inputs)
    sendRequest().then(()=>history('/user-details'))
  };

    return(
        <div>
            <h1>Update User</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={inputs.name || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="gmail">Gmail</label>
                    <input
                        id="gmail"
                        name="gmail"
                        type="email"
                        value={inputs.gmail || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="address">Address</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        value={inputs.address || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Update</button>
            </form>
        </div>
    )
}

export default UpdateUser