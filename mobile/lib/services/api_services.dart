import 'dart:convert';
import 'package:http/http.dart' as http;
import '../model/buku.dart';

class ApiService {
  static const baseUrl = "http://10.0.2.2:8080/my_mobile_katalog/";

  static Future<List<Buku>> getBuku() async {
    final response = await http.get(Uri.parse("$baseUrl/buku.php"));
    if (response.statusCode == 200) {
      List data = jsonDecode(response.body);
      return data.map((e) => Buku.fromJson(e)).toList();
    } else {
      throw Exception("Gagal memuat data buku");
    }
  }

  //fungsi hapus
  static Future<bool> deleteBuku(String id) async {
    final response = await http.post(
      Uri.parse("$baseUrl/hapusData.php"),
      body: {'id': id},
    );
    return response.statusCode == 200 &&
        jsonDecode(response.body)['status'] == 'success';
  }

  // tambah
  static Future<bool> addBukuFull(
    String judul,
    String penulis,
    String penerbit,
    String kategori,
    String deskripsi,
    int tahunTerbit,
    int tebalBuku,
    String cover,
  ) async {
    final response = await http.post(
      Uri.parse("${baseUrl}addData.php"),
      body: {
        'judul': judul,
        'penulis': penulis,
        'penerbit': penerbit,
        'kategori': kategori,
        'deskripsi': deskripsi,
        'tahun_terbit': tahunTerbit,
        'tebal_buku': tebalBuku,
        'cover': cover,
      },
    );

    return response.statusCode == 200 &&
        jsonDecode(response.body)['status'] == 'success';
  }

  //edit buku
  static Future<bool> updateBuku(
    int id,
    String judul,
    String penulis,
    String penerbit,
    String kategori,
    String deskripsi,
    int tahunTerbit,
    int tebalBuku,
    String cover,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/update_buku.php'),
        body: {
          'id': id.toString(),
          'judul': judul,
          'penulis': penulis,
          'penerbit': penerbit,
          'kategori': kategori,
          'deskripsi': deskripsi,
          'tahun_terbit': tahunTerbit.toString(),
          'tebal_buku': tebalBuku.toString(),
          'cover': cover,
        },
      );

      final data = jsonDecode(response.body);
      return data['success'] == true;
    } catch (e) {
      print('Error update buku: $e');
      return false;
    }
  }
}
