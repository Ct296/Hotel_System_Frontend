// src/services/RoomService.js
import api from '../utils/axios'; 

export default {
    getPublicRooms() {
        return api.get('/api/public/rooms');
    }
}