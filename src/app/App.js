import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <>
      {/* Your existing app content */}
      {Platform.OS === 'web' && <ToastContainer />}
    </>
  );
}; 