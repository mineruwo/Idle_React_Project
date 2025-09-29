import 'package:json_annotation/json_annotation.dart';

part 'notice.g.dart';

@JsonSerializable()
class Notice {
  final int id;
  final String title;
  final String content;
  @JsonKey(name: 'createdAt')
  final DateTime createdAt;
  @JsonKey(name: 'is_del')
  final bool? isDel;

  Notice({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.isDel,
  });

  factory Notice.fromJson(Map<String, dynamic> json) => _$NoticeFromJson(json);
  Map<String, dynamic> toJson() => _$NoticeToJson(this);
}
