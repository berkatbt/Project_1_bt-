import 'package:flutter/material.dart';
import '../../model/buku.dart';
import '../aksi_admin/edit_buku_page.dart';
import '../../services/api_services.dart';

class DetailBukuPage extends StatelessWidget {
  final Buku buku;

  const DetailBukuPage({super.key, required this.buku});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: Colors.grey[200],
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(buku.judul),
      ),
      body: Stack(
        children: [
          // Background gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blueAccent, Colors.lightBlueAccent],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),

          // Content scroll
          SingleChildScrollView(
            child: Column(
              children: [
                // Cover buku dengan overlay
                Stack(
                  children: [
                    Container(
                      height: 300,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        image: DecorationImage(
                          image: buku.cover != null && buku.cover!.isNotEmpty
                              ? NetworkImage(buku.cover!)
                              : const AssetImage('assets/image/default.png')
                                  as ImageProvider,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Container(
                      height: 300,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.black.withOpacity(0.4),
                            Colors.transparent
                          ],
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                        ),
                      ),
                    ),
                    Positioned(
                      bottom: 16,
                      left: 16,
                      right: 16,
                      child: Text(
                        buku.judul,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          shadows: [
                            Shadow(
                              color: Colors.black54,
                              blurRadius: 5,
                              offset: Offset(0, 2),
                            )
                          ],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    )
                  ],
                ),

                const SizedBox(height: 20),

                // Glassmorphism Card
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.85),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black12,
                          blurRadius: 10,
                          offset: const Offset(0, 5),
                        )
                      ],
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          InfoRow(title: "Penulis", value: buku.penulis ?? "-"),
                          InfoRow(
                              title: "Penerbit", value: buku.penerbit ?? "-"),
                          InfoRow(title: "Kategori", value: buku.kategori ?? "-"),
                          InfoRow(
                              title: "Tahun Terbit",
                              value: buku.tahunTerbit?.toString() ?? "-"),
                          InfoRow(
                              title: "Tebal Buku",
                              value:
                                  "${buku.tebalBuku?.toString() ?? '-'} halaman"),
                          const SizedBox(height: 16),
                          const Text(
                            "Deskripsi",
                            style: TextStyle(
                                fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            buku.deskripsi ?? "Tidak ada deskripsi",
                            style: const TextStyle(fontSize: 16),
                          ),
                          const SizedBox(height: 20),
                          // Tombol Edit & Delete
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              ElevatedButton.icon(
                                icon: const Icon(Icons.edit),
                                label: const Text("Edit"),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.lightBlueAccent,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: () async {
                                  final result = await Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                        builder: (_) =>
                                            EditBukuPage(buku: buku)),
                                  );
                                  if (result == true) {
                                    Navigator.pop(context, true);
                                  }
                                },
                              ),
                            //   ElevatedButton.icon(
                            //     icon: const Icon(Icons.delete),
                            //     label: const Text("Hapus"),
                            //     style: ElevatedButton.styleFrom(
                            //       backgroundColor: Colors.redAccent,
                            //       shape: RoundedRectangleBorder(
                            //         borderRadius: BorderRadius.circular(12),
                            //       ),
                            //     ),
                            //     onPressed: () async {
                            //       final confirm = await showDialog(
                            //         context: context,
                            //         builder: (_) => AlertDialog(
                            //           title: const Text("Hapus Buku"),
                            //           content: const Text(
                            //               "Yakin ingin menghapus buku ini?"),
                            //           actions: [
                            //             TextButton(
                            //               onPressed: () =>
                            //                   Navigator.pop(context, false),
                            //               child: const Text("Batal"),
                            //             ),
                            //             ElevatedButton(
                            //               onPressed: () =>
                            //                   Navigator.pop(context, true),
                            //               child: const Text("Hapus"),
                            //             ),
                            //           ],
                            //         ),
                            //       );
                            //       if (confirm == true) {
                            //         await ApiService.deleteBuku(buku.id);
                            //         Navigator.pop(context, true);
                            //       }
                            //     },
                            //   ),
                             ],
                          )
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 30),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Widget InfoRow
class InfoRow extends StatelessWidget {
  final String title;
  final String value;

  const InfoRow({super.key, required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        children: [
          Text(
            "$title: ",
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }
}
