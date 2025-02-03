import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';

const RecordRequestForm = ({ record, onSuccess }) => {
  const queryClient = useQueryClient();

  const createRequest = async (values) => {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/requests`, values);
    return response.data;
  };

  const mutation = useMutation(createRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries('requests');
      onSuccess?.();
    },
  });

  const formik = useFormik({
    initialValues: {
      recordId: record.id,
      reason: '',
    },
    validationSchema: Yup.object({
      reason: Yup.string()
        .min(10, 'Must be at least 10 characters')
        .required('Required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      await mutation.mutateAsync(values);
      resetForm();
    },
  });

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Request Record: {record.title}
      </Typography>
      <Box component="form" onSubmit={formik.handleSubmit}>
        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {mutation.error.response?.data?.message || 'Failed to submit request'}
          </Alert>
        )}
        {mutation.isSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Request submitted successfully
          </Alert>
        )}
        <TextField
          fullWidth
          multiline
          rows={4}
          name="reason"
          label="Reason for Request"
          value={formik.values.reason}
          onChange={formik.handleChange}
          error={formik.touched.reason && Boolean(formik.errors.reason)}
          helperText={formik.touched.reason && formik.errors.reason}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isLoading}
          startIcon={mutation.isLoading ? <CircularProgress size={20} /> : null}
        >
          Submit Request
        </Button>
      </Box>
    </Paper>
  );
};

export default RecordRequestForm;
