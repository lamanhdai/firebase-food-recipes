import { useState } from 'react';
import FirebaseAuthService from '../FirebaseAuthService';

function LoginForm({ existingUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await FirebaseAuthService.loginUser(username, password);
      setUsername('');
      setPassword('');
    } catch(err) {
      alert(err.message);
    }
  }

  function handleLogOut() {
    FirebaseAuthService.logoutUser();
  }

  async function handleSendPasswordResetEmail() {
    if(!username) {
      alert('Missing username!');
      return;
    }

    try {
      await FirebaseAuthService.handlerSendPasswordResetEmail(username);
      alert('sent password reset email!')
    } catch(err) {
      alert(err.message);
    }
  }

  return (
    <div className="login-form-container">
      {
        existingUser ? <div className='row'>
          <h3>Welcome, {existingUser.email}</h3>
          <button type="button" className='primary-button' onClick={handleLogOut}>Logout</button>
        </div>
        : (
          <form onSubmit={handleSubmit} className='login-form'>
            <label className='input-label login-label'>
              Username (email):
              <input
                type='text'
                required
                value={username}
                className='input-text'
                onChange={(e) => setUsername(e.target.value)}/>
            </label>
            <label className='input-label login-label'>
              Password:
              <input
                type='password'
                required
                value={password}
                className='input-text'
                onChange={(e) => setPassword(e.target.value)}/>
            </label>
            <div className='button-box'>
              <button className='primary-button'>Login</button>
              <button type='button' className='primary-button' onClick={handleSendPasswordResetEmail}>Reset Password</button>
            </div>
          </form>
        )
      }
    </div>
    // <h1>Login Form</h1>
  )
}

export default LoginForm;