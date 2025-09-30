// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'inquiry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Inquiry _$InquiryFromJson(Map<String, dynamic> json) => Inquiry(
  id: json['inquiryId'] as String,
  title: json['inquiryTitle'] as String,
  content: json['inquiryContent'] as String,
  createdAt: DateTime.parse(json['createdAt'] as String),
  status: json['status'] as String,
  response: json['inquiryAnswer'] as String?,
  userId: (json['customerIdNum'] as num).toInt(),
  answeredAt: json['answeredAt'] == null
      ? null
      : DateTime.parse(json['answeredAt'] as String),
  adminId: json['adminId'] as String?,
);

Map<String, dynamic> _$InquiryToJson(Inquiry instance) => <String, dynamic>{
  'inquiryId': instance.id,
  'inquiryTitle': instance.title,
  'inquiryContent': instance.content,
  'createdAt': instance.createdAt.toIso8601String(),
  'status': instance.status,
  'inquiryAnswer': instance.response,
  'customerIdNum': instance.userId,
  'answeredAt': instance.answeredAt?.toIso8601String(),
  'adminId': instance.adminId,
};
