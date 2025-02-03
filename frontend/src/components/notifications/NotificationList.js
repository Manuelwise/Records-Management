import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Badge,
  Box,
  CircularProgress,
  Paper
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const NotificationList = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery(
    'notifications',
    async () => {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/notifications`);
      return response.data.data;
    },
    {
      refetchInterval: 30000 // Refetch every 30 seconds
    }
  );

  const markAsRead = useMutation(
    async (notificationId) => {
      await axios.put(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      }
    }
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'request_approved':
        return <CheckCircleIcon color="success" />;
      case 'request_rejected':
        return <CheckCircleIcon color="error" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <Paper elevation={3}>
      <Box p={2} bgcolor="primary.main" color="primary.contrastText">
        <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
          Notifications
          <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }}>
            <NotificationsIcon />
          </Badge>
        </Typography>
      </Box>
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {notifications?.length === 0 ? (
          <ListItem>
            <ListItemText primary="No notifications" />
          </ListItem>
        ) : (
          notifications?.map((notification) => (
            <ListItem
              key={notification._id}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              secondaryAction={
                !notification.read && (
                  <IconButton
                    edge="end"
                    onClick={() => markAsRead.mutate(notification._id)}
                    disabled={markAsRead.isLoading}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                )
              }
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={notification.message}
                secondary={formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
};

export default NotificationList;
