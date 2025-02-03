import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  IconButton,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import { useQuery } from 'react-query';
import axios from 'axios';
import RecordRequestForm from './RecordRequestForm';

const RecordList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: records, isLoading, error } = useQuery(
    ['records', searchTerm],
    async () => {
      const url = searchTerm
        ? `${process.env.REACT_APP_API_URL}/records/search?query=${searchTerm}`
        : `${process.env.REACT_APP_API_URL}/records`;
      const response = await axios.get(url);
      return response.data.data;
    }
  );

  const handleRequestClick = (record) => {
    setSelectedRecord(record);
  };

  const handleCloseDialog = () => {
    setSelectedRecord(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        Error loading records: {error.response?.data?.message || 'Unknown error'}
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <IconButton>
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </Box>

      <Grid container spacing={2}>
        {records?.map((record) => (
          <Grid item xs={12} sm={6} md={4} key={record.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {record.title}
                  </Typography>
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  File Number: {record.fileNumber}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  {record.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Chip
                    label={record.status}
                    color={record.status === 'available' ? 'success' : 'error'}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    size="small"
                    disabled={record.status !== 'available'}
                    onClick={() => handleRequestClick(record)}
                  >
                    Request Record
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={Boolean(selectedRecord)}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedRecord && (
          <Box sx={{ p: 2 }}>
            <RecordRequestForm
              record={selectedRecord}
              onSuccess={handleCloseDialog}
            />
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default RecordList;
