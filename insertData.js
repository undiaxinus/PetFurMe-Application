import { supabase } from './supabaseclient';  // Correct the path if necessary

async function insertData(email, password, confirm_pass) {
  if (password !== confirm_pass) {
    console.error('Passwords do not match!');
    return;
  }

  async function signUp(email, password) {
    const { user, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      confirm_pass: confirm_pass
    });
  
    if (error) {
      console.error('Error signing up:', error.message);
      return;
    }
  
    console.log('User signed up successfully:', user);
    return user;  // Return the authenticated user
  }
  
}

export default insertData;
