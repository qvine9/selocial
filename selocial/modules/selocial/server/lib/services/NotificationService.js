class _NotificationService {
    
    static notify(userId, message, type, params){
        User.update({_id: userId}, {$inc: {notificationCount: 1}});
        return Notification.insert({
            userId: userId, 
            message: message,
            type: type || 'info',
            params: params || {},
            date: new Date()
        });
    }
    
}

// export
NotificationService = _NotificationService;