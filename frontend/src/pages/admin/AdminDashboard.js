import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Tab,
  Tabs
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const queryClient = useQueryClient();

  const { data: requests, isLoading: requestsLoading } = useQuery(
    'allRequests',
    async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/requests`);
      return response.data.data;
    }
  );

  const { data: records, isLoading: recordsLoading } = useQuery(
    'allRecords',
    async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/records`);
      return response.data.data;
    }
  );

  const updateRequestStatus = useMutation(
    async ({ requestId, status }) => {
      await axios.put(`${process.env.REACT_APP_API_URL}/requests/${requestId}`, { status });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allRequests');
      }
    }
  );

  const markAsReturned = useMutation(
    async (requestId) => {
      await axios.put(`${process.env.REACT_APP_API_URL}/requests/${requestId}/return`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allRequests');
        queryClient.invalidateQueries('allRecords');
      }
    }
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'returned':
        return 'info';
      default:
        return 'warning';
    }
  };

  const PendingRequests = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Record</TableCell>
            <TableCell>Requester</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests?.filter(req => req.status === 'pending').map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.Record.title}</TableCell>
              <TableCell>{request.requester.username}</TableCell>
              <TableCell>{format(new Date(request.requestDate), 'PPp')}</TableCell>
              <TableCell>
                <Chip label={request.status} color={getStatusColor(request.status)} />
              </TableCell>
              <TableCell>
                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => updateRequestStatus.mutate({
                      requestId: request.id,
                      status: 'approved'
                    })}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => updateRequestStatus.mutate({
                      requestId: request.id,
                      status: 'rejected'
                    })}
                  >
                    Reject
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const ActiveRequests = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Record</TableCell>
            <TableCell>Requester</TableCell>
            <TableCell>Checkout Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests?.filter(req => req.status === 'approved').map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.Record.title}</TableCell>
              <TableCell>{request.requester.username}</TableCell>
              <TableCell>{format(new Date(request.requestDate), 'PPp')}</TableCell>
              <TableCell>
                <Chip label="Checked Out" color="warning" />
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => markAsReturned.mutate(request.id)}
                >
                  Mark Returned
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (requestsLoading || recordsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total Records</Typography>
            <Typography variant="h3">{records?.length || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Pending Requests</Typography>
            <Typography variant="h3">
              {requests?.filter(req => req.status === 'pending').length || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Checked Out Records</Typography>
            <Typography variant="h3">
              {records?.filter(rec => rec.status === 'checked_out').length || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Pending Requests" />
          <Tab label="Active Checkouts" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          {activeTab === 0 ? <PendingRequests /> : <ActiveRequests />}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
