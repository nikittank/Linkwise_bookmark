import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthContainer = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        onLogin(userData);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [onLogin]);

  const handleSwitchMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
      {isLogin ? (
        <LoginForm 
          onLogin={onLogin} 
          onSwitchToSignup={handleSwitchMode}
        />
      ) : (
        <SignupForm 
          onLogin={onLogin} 
          onSwitchToLogin={handleSwitchMode}
        />
      )}
    </div>
  );
};

export default AuthContainer;