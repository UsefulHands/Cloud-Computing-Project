import { useEffect, useState } from 'react';
import { getUsers } from '../services/userService';
import UserCard from '../components/UserCard';

function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers()
      .then(res => setUsers(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

export default UsersPage;