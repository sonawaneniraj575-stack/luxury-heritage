import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Crown, Mail, Lock, User, Phone, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/auth'

interface AuthModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'register'
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onOpenChange, defaultTab = 'login' }) => {
  const { login, register, isLoading } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({})
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptsTerms: false,
    acceptsMarketing: false
  })
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const errors: Record<string, string> = {}
    if (!loginForm.email) errors.email = 'Email is required'
    else if (!validateEmail(loginForm.email)) errors.email = 'Please enter a valid email'
    if (!loginForm.password) errors.password = 'Password is required'
    
    setLoginErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      const success = await login({ email: loginForm.email, password: loginForm.password })
      if (success) {
        onOpenChange(false)
        setLoginForm({ email: '', password: '' })
      } else {
        setLoginErrors({ password: 'Invalid email or password' })
      }
    } catch (error) {
      setLoginErrors({ password: 'Login failed. Please try again.' })
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const errors: Record<string, string> = {}
    if (!registerForm.firstName) errors.firstName = 'First name is required'
    if (!registerForm.lastName) errors.lastName = 'Last name is required'
    if (!registerForm.email) errors.email = 'Email is required'
    else if (!validateEmail(registerForm.email)) errors.email = 'Please enter a valid email'
    if (!registerForm.password) errors.password = 'Password is required'
    else if (!validatePassword(registerForm.password)) errors.password = 'Password must be at least 6 characters'
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    if (!registerForm.acceptsTerms) errors.acceptsTerms = 'You must accept the terms and conditions'
    
    setRegisterErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      const success = await register({
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
        acceptsMarketing: registerForm.acceptsMarketing
      })
      
      if (success) {
        onOpenChange(false)
        setRegisterForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          acceptsTerms: false,
          acceptsMarketing: false
        })
      }
    } catch (error) {
      setRegisterErrors({ email: 'Registration failed. Please try again.' })
    }
  }

  const updateLoginForm = (field: string, value: string) => {
    setLoginForm(prev => ({ ...prev, [field]: value }))
    if (loginErrors[field]) {
      setLoginErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const updateRegisterForm = (field: string, value: string | boolean) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }))
    if (registerErrors[field]) {
      setRegisterErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="h-8 w-8 text-gold" />
          </div>
          <DialogTitle className="text-2xl font-luxury-heading">
            Welcome to Maison Heritage
          </DialogTitle>
          <DialogDescription>
            Access your account or create one to enjoy exclusive benefits
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) => updateLoginForm('email', e.target.value)}
                    className={`pl-10 ${loginErrors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {loginErrors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => updateLoginForm('password', e.target.value)}
                    className={`pl-10 pr-10 ${loginErrors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {loginErrors.password}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-luxury-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Demo: Use any email with password <code className="bg-muted px-1 rounded">demo123</code>
                </p>
              </div>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4 mt-6">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="register-firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-firstName"
                      placeholder="John"
                      value={registerForm.firstName}
                      onChange={(e) => updateRegisterForm('firstName', e.target.value)}
                      className={`pl-10 ${registerErrors.firstName ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {registerErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{registerErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-lastName">Last Name</Label>
                  <Input
                    id="register-lastName"
                    placeholder="Doe"
                    value={registerForm.lastName}
                    onChange={(e) => updateRegisterForm('lastName', e.target.value)}
                    className={registerErrors.lastName ? 'border-red-500' : ''}
                  />
                  {registerErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{registerErrors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="register-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerForm.email}
                    onChange={(e) => updateRegisterForm('email', e.target.value)}
                    className={`pl-10 ${registerErrors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {registerErrors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {registerErrors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="register-phone">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={registerForm.phone}
                    onChange={(e) => updateRegisterForm('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
                    value={registerForm.password}
                    onChange={(e) => updateRegisterForm('password', e.target.value)}
                    className={`pl-10 pr-10 ${registerErrors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {registerErrors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {registerErrors.password}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => updateRegisterForm('confirmPassword', e.target.value)}
                    className={`pl-10 ${registerErrors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                </div>
                {registerErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {registerErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptsTerms"
                    checked={registerForm.acceptsTerms}
                    onCheckedChange={(checked) => updateRegisterForm('acceptsTerms', checked)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="acceptsTerms" className="text-sm leading-relaxed">
                    I accept the{' '}
                    <a href="#" className="text-gold hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-gold hover:underline">Privacy Policy</a>
                  </Label>
                </div>
                {registerErrors.acceptsTerms && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {registerErrors.acceptsTerms}
                  </p>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptsMarketing"
                    checked={registerForm.acceptsMarketing}
                    onCheckedChange={(checked) => updateRegisterForm('acceptsMarketing', checked)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="acceptsMarketing" className="text-sm leading-relaxed">
                    I would like to receive exclusive offers and updates from Maison Heritage
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-luxury-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our luxury customer experience standards
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal