import React from 'react';
import { useParams } from 'react-router-dom';
import LandingPage from './LandingPage';

const ResetPasswordPage = () => {
  const { token } = useParams();
  return <LandingPage defaultAuthOpen={true} defaultAuthMode="reset" resetToken={token || ''} />;
};

export default ResetPasswordPage;
