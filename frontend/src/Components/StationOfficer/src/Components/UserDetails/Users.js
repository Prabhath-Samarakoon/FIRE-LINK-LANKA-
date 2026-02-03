import React, { useEffect, useState } from "react";
import axios from "axios";
import User from "../User/User";

const URL = "http://localhost:5000/api/users";

const fetchHandler= async()=>{
  try{
  return await axios.get(URL).then((res)=>res.data);
  }catch (err) {
    console.error("Fetch error:", err.message || err);
    // return an object shaped like a successful response so UI can handle it
    return { users: [] };
  }
};
function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchHandler().then((data) => {
      if (mounted) setUsers(data.users || []);
    });
    return () => (mounted = false);
  }, []);

  return (
    <div>
      <h1>User Details Display Page</h1>
      <div>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user, i) => (
            <div key={user._id || i}>
              <User user={user} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Users;
