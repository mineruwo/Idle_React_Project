// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notice.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Notice _$NoticeFromJson(Map<String, dynamic> json) => Notice(
  id: (json['id'] as num).toInt(),
  title: json['title'] as String,
  content: json['content'] as String,
  createdAt: DateTime.parse(json['createdAt'] as String),
  isDel: json['is_del'] as bool?,
);

Map<String, dynamic> _$NoticeToJson(Notice instance) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'content': instance.content,
  'createdAt': instance.createdAt.toIso8601String(),
  'is_del': instance.isDel,
};
