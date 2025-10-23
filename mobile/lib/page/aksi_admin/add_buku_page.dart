import 'package:flutter/material.dart';
import '../../services/api_services.dart';

class AddBukuPage extends StatefulWidget {
  const AddBukuPage({super.key});

  @override
  State<AddBukuPage> createState() => _AddBukuPageState();
}

class _AddBukuPageState extends State<AddBukuPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController judulC = TextEditingController();
  final TextEditingController penulisC = TextEditingController();
  final TextEditingController penerbitC = TextEditingController();
  final TextEditingController kategoriC = TextEditingController();
  final TextEditingController deskripsiC = TextEditingController();
  final TextEditingController tahunTerbitC = TextEditingController();
  final TextEditingController tebalBukuC = TextEditingController();
  final TextEditingController coverC = TextEditingController();

  bool _isLoading = false;

  Future<void> _simpanData() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      final success = await ApiService.addBukuFull(
        judulC.text,
        penulisC.text,
        penerbitC.text,
        kategoriC.text,
        deskripsiC.text,
        int.parse(tahunTerbitC.text),
        int.parse(tebalBukuC.text),
        coverC.text,
      );

      setState(() => _isLoading = false);

      if (success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("✅ Buku berhasil ditambahkan")),
          );
          Navigator.pop(context, true); // kembali & refresh
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("❌ Gagal menambahkan buku")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Tambah Buku")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              _buildTextField(judulC, "Judul Buku"),
              _buildTextField(penulisC, "Penulis"),
              _buildTextField(penerbitC, "Penerbit"),
              _buildTextField(kategoriC, "Kategori"),
              _buildTextField(deskripsiC, "Deskripsi", maxLines: 3),
              _buildTextField(tahunTerbitC, "Tahun Terbit", keyboardType: TextInputType.number),
              _buildTextField(tebalBukuC, "Tebal Buku (halaman)", keyboardType: TextInputType.number),
              _buildTextField(coverC, "URL Cover Buku"),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _isLoading ? null : _simpanData,
                icon: _isLoading
                    ? const SizedBox(
                        height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save),
                label: Text(_isLoading ? "Menyimpan..." : "Simpan"),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label,
      {int maxLines = 1, TextInputType? keyboardType}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        keyboardType: keyboardType,
        validator: (val) => val == null || val.isEmpty ? "Harap isi $label" : null,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}
