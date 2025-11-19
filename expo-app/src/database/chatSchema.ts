import { db } from "./chatDB";

export function createTables() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id TEXT PRIMARY KEY NOT NULL,
      shipId TEXT,
      employerId TEXT,
      chatRoomType TEXT,
      roomType TEXT,
      companyDetails TEXT,
      groupName TEXT,
      description TEXT,
      profileUrl TEXT,
      groupCreatedBy TEXT,
      isDefault INTEGER,
      status TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      isUnReadMessage INTEGER,
      unReadMessages INTEGER
    );
  `);

  db.execSync(`
  CREATE TABLE IF NOT EXISTS participants_details (
    id TEXT,
    email TEXT,
    fullName TEXT,
    profileUrl TEXT,
    chatRoomId TEXT
  );
`);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS chat_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatRoomId TEXT,
      userId TEXT,
      socketId TEXT,
      isTyping INTEGER,
      isOnline INTEGER,
      userRole TEXT,
      lastOnline TEXT,
      isRead INTEGER,
      unReadMessages INTEGER,
      lastReadAt TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS last_messages (
      id TEXT PRIMARY KEY NOT NULL,
      chatRoomId TEXT,
      senderId TEXT,
      messageType TEXT,
      content TEXT,
      fileName TEXT,
      createdAt TEXT,
      userData TEXT
    );
  `);





  db.execSync(`
    CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY NOT NULL,
  chatRoomId TEXT NOT NULL,
  senderId TEXT NOT NULL,
  messageType TEXT,
  replyTo TEXT,
  content TEXT,
  caption TEXT,
  fileName TEXT,
  thumbnail TEXT,
  createdAtId INTEGER,
  status TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  parentMessageId TEXT
);
  `);

  db.execSync(`
   CREATE TABLE IF NOT EXISTS message_users (
  id TEXT PRIMARY KEY NOT NULL,
  fullName TEXT,
  email TEXT,
  profileUrl TEXT,
  designation TEXT,
  department TEXT,
  ship TEXT
);
  `);


  



  db.execSync(`
 CREATE TABLE IF NOT EXISTS message_reactions (
  id TEXT PRIMARY KEY NOT NULL,
  messageId TEXT NOT NULL,
  userId TEXT NOT NULL,
  reaction TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  FOREIGN KEY(messageId) REFERENCES messages(id) ON DELETE CASCADE
);
  `);
}
