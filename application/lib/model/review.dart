class Review {
  final String id;
  final String orderId;
  final int rating;
  final String content;
  final String targetNickname; // Assuming this comes from the backend
  final DateTime createdAt; // Add createdAt field

  Review({
    required this.id,
    required this.orderId,
    required this.rating,
    required this.content,
    required this.targetNickname,
    required this.createdAt, // Add to constructor
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id']?.toString() ?? '',
      orderId: json['orderId']?.toString() ?? '',
      rating: json['rating'] as int,
      content: json['content'] ?? '',
      targetNickname: json['targetNickname'] ?? '',
      // Parse createdAt from string, provide a fallback
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }
}
