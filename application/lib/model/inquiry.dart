import 'package:json_annotation/json_annotation.dart';

part 'inquiry.g.dart';

@JsonSerializable()
class Inquiry {
  final int id;
  final String title;
  final String content;
  @JsonKey(name: 'createdAt')
  final DateTime createdAt;
  final String status;
  final String? response;
  final int userId;

  Inquiry({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.status,
    this.response,
    required this.userId,
  });

  factory Inquiry.fromJson(Map<String, dynamic> json) => _$InquiryFromJson(json);
  Map<String, dynamic> toJson() => _$InquiryToJson(this);
}
