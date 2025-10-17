import 'package:json_annotation/json_annotation.dart';

part 'inquiry.g.dart';

@JsonSerializable()
class Inquiry {
  @JsonKey(name: 'inquiryId')
  final String id;

  @JsonKey(name: 'inquiryTitle')
  final String title;

  @JsonKey(name: 'inquiryContent')
  final String content;

  final DateTime createdAt;
  final String status;

  @JsonKey(name: 'inquiryAnswer')
  final String? response;

  @JsonKey(name: 'customerIdNum')
  final int userId;

  final DateTime? answeredAt;
  final String? adminId;


  Inquiry({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.status,
    this.response,
    required this.userId,
    this.answeredAt,
    this.adminId,
  });

  factory Inquiry.fromJson(Map<String, dynamic> json) => _$InquiryFromJson(json);
  Map<String, dynamic> toJson() => _$InquiryToJson(this);
}
