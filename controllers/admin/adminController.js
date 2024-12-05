const User = require('../../models/userSchema');
const bcrypt = require('bcrypt');






const pageError=(req,res)=>{
  res.render('admin-error')
}


// Load login page
const Loadlogin = (req, res) => {
  if (req.session.admin) {
    return res.redirect('/admin/dashboard');  // Redirect to dashboard if already logged in
  }
  res.render('admin login', { message: null });
};

// Handle login request
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, isAdmin: true });  // Ensure 'isAdmin' is true in schema

    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password); // Compare hashed password
      if (passwordMatch) {
        req.session.admin = true;  // Store session for admin
        return res.redirect('/admin/dashboard');  // Redirect to dashboard
      } else {
        return res.render('admin login', { message: 'Incorrect password, please try again.' });
      }
    } else {
      return res.render('admin login', { message: 'No admin found with this email.' });
    }
  } catch (error) {
    console.log('Login error', error);
    return res.redirect('/pageError');  // Handle error and redirect to error page
  }
};

// Load the dashboard page for admin
const loadDashboard = async (req, res) => {
  if (req.session.admin) {
    try {
      res.render('dashboard');  // Render dashboard if admin is logged in
    } catch (error) {
      res.redirect('/pageError');  // Redirect to error page if something goes wrong
    }
  } else {
    res.redirect('/admin/login');  // Redirect to login if not logged in
  }
};


const logout = (req, res) => {
  try {
      if (req.session.admin) { // Check specifically for admin session
          req.session.destroy((err) => {
              if (err) {
                  console.log('Error destroying admin session:', err);
                  return res.redirect('/pageError'); // Redirect to a generic error page
              }
              return res.redirect('/admin/login'); // Redirect to admin login
          });
      } else {
          console.log('No admin session found.');
          return res.redirect('/admin/login'); // Redirect to admin login even if no session exists
      }
  } catch (error) {
      console.log('Unexpected error during admin logout:', error);
      res.redirect('/pageError');
  }
};


module.exports = { Loadlogin, login, loadDashboard,pageError,logout };
