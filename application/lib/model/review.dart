class Review {
  final String id;
  final String orderId;
  final int rating;
  final String content;
  final String targetNickname; // Assuming this comes from the backend

  Review({
    required this.id,
    required this.orderId,
    required this.rating,
    required this.content,
    required this.targetNickname,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id']?.toString() ?? '',
      orderId: json['orderId']?.toString() ?? '',
      rating: json['rating'] as int,
      content: json['content'] ?? '',
      targetNickname: json['targetNickname'] ?? '',
    );
  }
}
