import { Server } from "socket.io";
import config from "../config/index.js";
import prisma from "../config/database.js";
import jwt from "jsonwebtoken";

export function setupSocketIO(server) {
    const io = new Server(server, {
        cors: {
            origin: config.corsOrigin,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Authentication middleware for sockets
    io.use((socket, next) => {
        try {
            // Get token from auth payload or cookie (if accessible)
            const token = socket.handshake.auth?.token || extractCookie(socket.handshake.headers.cookie, "accessToken");
            
            if (!token) {
                return next(new Error("Authentication error"));
            }

            const decoded = jwt.verify(token, config.jwtSecret);
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error("Authentication error"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`🔌 User connected: ${socket.user.email} (${socket.id})`);

        // Join a specific study group
        socket.on("joinGroup", async (groupId) => {
            // Check if user is a member
            const membership = await prisma.groupMember.findUnique({
                where: { groupId_userId: { groupId, userId: socket.user.id } },
            });

            if (membership) {
                socket.join(groupId);
                console.log(`User ${socket.user.email} joined group ${groupId}`);
                // Emit system message to others in the room
                socket.to(groupId).emit("systemMessage", `${socket.user.name || "User"} joined the chat`);
            } else {
                socket.emit("error", "You are not a member of this group");
            }
        });

        // Leave a study group
        socket.on("leaveGroup", (groupId) => {
            socket.leave(groupId);
            console.log(`User ${socket.user.email} left group ${groupId}`);
        });

        // Handle incoming messages
        socket.on("sendMessage", async ({ groupId, content }) => {
            try {
                if (!content || !groupId) return;

                // Save message to DB
                const message = await prisma.groupMessage.create({
                    data: {
                        content,
                        groupId,
                        userId: socket.user.id,
                    },
                    include: {
                        user: { select: { id: true, name: true, avatar: true } }
                    }
                });

                // Broadcast to all clients in the group
                io.to(groupId).emit("newMessage", message);
            } catch (error) {
                console.error("Socket send message error:", error);
                socket.emit("error", "Failed to send message");
            }
        });

        socket.on("disconnect", () => {
            console.log(`🔌 User disconnected: ${socket.user.email} (${socket.id})`);
        });
    });

    return io;
}

function extractCookie(cookieHeader, name) {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}
