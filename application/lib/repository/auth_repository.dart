
import 'package:application/model/login_model.dart';
import 'package:application/network/dio_client.dart';

class AuthRepository {
  final DioClient dioClient = DioClient();

  Future<LoginModel> login({
    required String id,
    required String password,
  }) async {
    final response = await dioClient.dio.post("/auth/login", data: {
      "id": id,
      "passwordEnc": password,
    });

    return LoginModel.fromJson(response.data);
  }
}