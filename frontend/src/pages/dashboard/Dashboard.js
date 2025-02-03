import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider
} from '@mui/material';
import RecordList from '../../components/records/RecordList';
import NotificationList from '../../components/notifications/NotificationList';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.username}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Available Records
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <RecordList />
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <NotificationList />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
