import Image from "next/image";
import { motion } from "framer-motion";
import { formatDistanceToNow } from 'date-fns';
import {IconHourglassEmpty, IconUserPlus, IconUserCheck, IconDeviceGamepad2} from '@tabler/icons-react'

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'friend_request':
      return (
        <IconUserPlus
          className="w-5 h-5"
          strokeWidth={2}
        />
      );
    case 'friend_request_sent':
      return (
        <IconUserPlus
          className="w-5 h-5 text-blue-500"
          strokeWidth={2}
        />
      );
    case 'friend_accept':
      return (
        <IconUserCheck
          className="w-5 h-5"
          strokeWidth={2}
        />
      );
    case 'game_invitation':
      return (
        <IconDeviceGamepad2
          className="w-5 h-5"
          strokeWidth={2}
        />
      );
    default:
      return (
        <Image 
          src="/images/Notif.svg" 
          alt="notification" 
          width={20} 
          height={20} 
          className="w-5 h-5"
        />
      );
  }
};

const NotificationItem = ({ notification, onClick }) => {
  const timeAgo = notification.timestamp 
    ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })
    : '';


  return (
    <div 
      className="sm:w-[95%] w-[98%] min-h-[70px] mt-[20px] bg-[#CDCDE5] hover:bg-[#BDBDD5] transition-colors rounded-xl flex items-start p-4 mb-2 cursor-pointer relative"
      onClick={() => onClick && onClick(notification)}
    >
      {notification.isNew && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      )}
      <div className="flex-shrink-0">
        <img
          src={notification.avatar}
          alt="profile"
          className="w-10 h-10 rounded-full"
        />
      </div>
      
      <div className="ml-3 flex-grow">
        <p className="font-semibold text-sm text-[#242F5C] mb-1">
          {notification.message}
        </p>
        <p className="text-xs text-[#6B7280]">
          {timeAgo}
        </p>
      </div>

      <div className="flex-shrink-0 ml-2">
        <NotificationIcon type={notification.type} />
      </div>
    </div>
  );
};

const NotificationDropdown = ({ notifications = [], onNotificationClick }) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 30,
      }}
      className="w-[300px] sm:w-[400px] bg-[#EAEAFF] absolute top-[75px] right-[128px] z-[10] rounded-[10px] border-2 border-solid border-[#C0C7E0] shadow-lg overflow-hidden"
    >
      <div className="p-4 border-b border-[#C0C7E0]">
        <h3 className="text-[#242F5C] font-semibold">Notifications</h3>
      </div>
      
      <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div className="flex flex-col items-center min-h-full p-2">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification}
                onClick={onNotificationClick}
              />
            ))
          ) : (
            <div className="py-8 text-center text-[#242F5C]">
              <IconHourglassEmpty className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationDropdown;