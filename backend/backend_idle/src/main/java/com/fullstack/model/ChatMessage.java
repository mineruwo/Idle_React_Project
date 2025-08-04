package com.fullstack.model;

public class ChatMessage {
    private String sender;
    private String content;
    private String chatRoomId;

    public ChatMessage() {
    }

    public ChatMessage(String sender, String content, String chatRoomId) {
        this.sender = sender;
        this.content = content;
        this.chatRoomId = chatRoomId;
    }

    // Getter와 Setter
    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getChatRoomId() {
        return chatRoomId;
    }

    public void setChatRoomId(String chatRoomId) {
        this.chatRoomId = chatRoomId;
    }

    @Override
    public String toString() {
        return "ChatMessage{" +
               "sender='" + sender + ' ' +
               ", content='" + content + ' ' +
               ", chatRoomId='" + chatRoomId + ' ' +
               '}';
    }
}