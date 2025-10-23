import 'package:flutter/material.dart';
//import 'package:mobile/page/aksi_admin/edit_buku_page.dart';
import '../model/buku.dart';
import '../services/api_services.dart';
import '../page/aksi_admin/add_buku_page.dart'; // pastikan sudah diimport
import './aksi_admin/detail_buku_page.dart';

class HomePageAdmin extends StatefulWidget {
  const HomePageAdmin({super.key});

  @override
  State<HomePageAdmin> createState() => _HomePageAdminState();
}

class _HomePageAdminState extends State<HomePageAdmin> {
  late Future<List<Buku>> futureBuku;

  @override
  void initState() {
    super.initState();
    refresh();
  }

  void refresh() {
    setState(() {
      futureBuku = ApiService.getBuku();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Manajemen Buku")),
      body: FutureBuilder<List<Buku>>(
        future: futureBuku,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text("Tidak ada data"));
          }

          final data = snapshot.data!;
          return ListView.builder(
            itemCount: data.length,
            itemBuilder: (context, index) {
              final buku = data[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundImage:
                        buku.cover != null && buku.cover!.isNotEmpty
                        ? NetworkImage(buku.cover!)
                        : const AssetImage('assets/image/default.png')
                              as ImageProvider,
                    onBackgroundImageError: (_, __) {
                      debugPrint("Gagal memuat gambar: ${buku.cover}");
                    },
                  ),
                  title: Text(
                    buku.judul,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text("${buku.penulis} • ${buku.kategori}"),
                  
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DetailBukuPage(buku: buku),
                      ),
                    );
                  },

                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // IconButton(
                      //   icon: const Icon(Icons.edit, color: Colors.lightBlueAccent),

                      //   onPressed:  () async {
                      //     //buka halaman edit kirim data buku yang mau di ubah!
                      //     final result = await Navigator.push(
                      //       context,
                      //       MaterialPageRoute(builder: 
                      //       (_) => EditBukuPage(buku: buku),
                      //       ),
                      //     );

                      //     if (result == true) {
                      //       refresh(); //refresh data setelah edit
                      //     };
                      //   },
                      // ),
                      IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),

                        onPressed: () async {
                          final confirm = await showDialog(
                            context: context,
                            builder: (_) => AlertDialog(
                              title: const Text("Hapus Buku"),
                              content: const Text(
                                "Yakin ingin menghapus buku ini?",
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () =>
                                      Navigator.pop(context, false),
                                  child: const Text("Batal"),
                                ),
                                ElevatedButton(
                                  onPressed: () => Navigator.pop(context, true),
                                  child: const Text("Hapus"),
                                ),
                              ],
                            ),
                          );

                          if (confirm == true) {
                            await ApiService.deleteBuku(buku.id);
                            refresh();
                          }
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          // 🔹 Navigasi ke halaman tambah buku
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const AddBukuPage()),
          );

          // 🔹 Setelah berhasil tambah, refresh daftar buku
          if (result == true) {
            refresh();
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
