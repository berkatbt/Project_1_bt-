class Buku {
  final String id;
  final String judul;
  final String penulis;
  final String kategori;
  final String? penerbit;
  final String? deskripsi;
  final String? tahunTerbit;
  final String? tebalBuku;
  final String? cover;

  Buku({
    required this.id,
    required this.judul,
    required this.penulis,
    required this.kategori,
    this.penerbit,
    this.deskripsi,
    this.tahunTerbit,
    this.tebalBuku,
    this.cover,
  });

  factory Buku.fromJson(Map<String, dynamic> json) {
    return Buku(
      id: json['id'].toString(),
      judul: json['judul'] ?? '',
      penulis: json['penulis'] ?? '',
      kategori: json['kategori'] ?? '',
      penerbit: json['penerbit'],
      deskripsi: json['deskripsi'],
      tahunTerbit: json['tahun_terbit'],
      tebalBuku: json['tebal_buku'],
      cover: json['cover'],
    );
  }

  
}
