import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { useToast } from '../components/ToastContainer'
import './Login.css'

function Login() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const navigate = useNavigate()
  const toast = useToast()

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    if (loginId === 'Admin' && password === 'Admin') {
      toast.success('✓ Login successful! Welcome back.', 2000)
      setTimeout(() => navigate('/dashboard'), 500)
    } else {
      toast.error('✗ Invalid credentials. Please try again.', 3000)
    }
  }

  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    console.log('Register attempted with:', registerData)
    setIsModalOpen(false)
  }

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value })
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setRegisterData({ username: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div className="login-homepage">
      <img src="/logo.png" alt="Company Logo" className="company-logo" />
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <svg className="login-logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#4a22fa" strokeWidth="2" />
              <path d="M2 17L12 22L22 17" stroke="#4a22fa" strokeWidth="2" />
              <path d="M2 12L12 17L22 12" stroke="#4a22fa" strokeWidth="2" />
            </svg>
            <h1 className="login-title">Tender System</h1>
          </div>
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="loginId">Login ID</label>
              <input
                type="text"
                id="loginId"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter your Login ID"
                className="form-input"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="form-action-btn">
              <FontAwesomeIcon icon={faSignInAlt} className="btn-icon" />
              Login
            </button>
          </form>
          <div className="register-link">
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => setIsModalOpen(true)} className="register-link-btn">
                Register
              </button>
            </p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-back-btn" onClick={closeModal}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h2 className="modal-title">Register</h2>
            <form onSubmit={handleRegisterSubmit} className="modal-form">
              <div className="modal-field">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  placeholder="Enter your username"
                  className="modal-input"
                  required
                />
              </div>
              <div className="modal-field">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="Enter your email"
                  className="modal-input"
                  required
                />
              </div>
              <div className="modal-field">
                <label htmlFor="reg-password">Password</label>
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Enter your password"
                  className="modal-input"
                  required
                />
              </div>
              <div className="modal-field">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  placeholder="Confirm your password"
                  className="modal-input"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-action-btn">
                  <FontAwesomeIcon icon={faUserPlus} className="btn-icon" />
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
