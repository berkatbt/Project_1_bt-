import 'package:flutter/material.dart';
import '../../model/buku.dart';
import '../../services/api_services.dart';

class EditBukuPage extends StatefulWidget {
  final Buku buku;

  const EditBukuPage({super.key, required this.buku});

  @override
  State<EditBukuPage> createState() => _EditBukuPageState();
}

class _EditBukuPageState extends State<EditBukuPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController judulC;
  late TextEditingController penulisC;
  late TextEditingController penerbitC;
  late TextEditingController kategoriC;
  late TextEditingController deskripsiC;
  late TextEditingController tahunTerbitC;
  late TextEditingController tebalBukuC;
  late TextEditingController coverC;

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // isi otomatis dengan data lama
    judulC = TextEditingController(text: widget.buku.judul);
    penulisC = TextEditingController(text: widget.buku.penulis);
    penerbitC = TextEditingController(text: widget.buku.penerbit ?? '');
    kategoriC = TextEditingController(text: widget.buku.kategori);
    deskripsiC = TextEditingController(text: widget.buku.deskripsi ?? '');
    tahunTerbitC = TextEditingController(text: widget.buku.tahunTerbit?.toString() ?? '');
    tebalBukuC = TextEditingController(text: widget.buku.tebalBuku?.toString() ?? '');
    coverC = TextEditingController(text: widget.buku.cover ?? '');
  }

  Future<void> _updateData() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      final success = await ApiService.updateBuku(
        int.parse(widget.buku.id),
        judulC.text,
        penulisC.text,
        penerbitC.text,
        kategoriC.text,
        deskripsiC.text,
        int.tryParse(tahunTerbitC.text) ?? 0,
        int.tryParse(tebalBukuC.text) ?? 0,
        coverC.text,
      );

      setState(() => _isLoading = false);

      if (success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("✅ Buku berhasil diperbarui")),
          );
          Navigator.pop(context, true); // kembali & refresh
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("❌ Gagal memperbarui buku")),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Edit Buku")),
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
                onPressed: _isLoading ? null : _updateData,
                icon: _isLoading
                    ? const SizedBox(
                        height: 16, width: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.save),
                label: Text(_isLoading ? "Menyimpan..." : "Simpan Perubahan"),
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
