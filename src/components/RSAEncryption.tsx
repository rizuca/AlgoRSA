import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { RSAUtils } from './RSAUtils';
import { RefreshCw, Lock, Unlock, Key, Shield, Eye, EyeOff, RotateCcw, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function RSAEncryption() {
  const [keys, setKeys] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [encryptedData, setEncryptedData] = useState<number[]>([]);
  const [decryptedText, setDecryptedText] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Manual input states for decryption
  const [useManualInput, setUseManualInput] = useState(false);
  const [manualEncryptedInput, setManualEncryptedInput] = useState('');
  const [manualPrivateKeyN, setManualPrivateKeyN] = useState('');
  const [manualPrivateKeyD, setManualPrivateKeyD] = useState('');
  const [decryptError, setDecryptError] = useState('');

  // Generate kunci saat komponen dimuat
  useEffect(() => {
    generateKeys();
  }, []);

  const generateKeys = async () => {
    setIsGenerating(true);
    setDecryptError('');
    
    // Simulasi loading untuk efek visual
    setTimeout(() => {
      try {
        const newKeys = RSAUtils.generateKeyPair();
        
        // Validasi kunci yang dihasilkan
        if (!RSAUtils.validateKeys(newKeys.publicKey, newKeys.privateKey)) {
          throw new Error('Generated keys are invalid');
        }
        
        setKeys(newKeys);
        setEncryptedData([]);
        setDecryptedText('');
        setIsGenerating(false);
      } catch (error) {
        console.error('Error generating keys:', error);
        setDecryptError('Gagal generate kunci RSA. Mencoba lagi...');
        setIsGenerating(false);
        // Retry after a short delay
        setTimeout(() => generateKeys(), 500);
      }
    }, 1000);
  };

  const handleEncrypt = () => {
    if (!inputText || !keys) return;
    
    setDecryptError('');
    
    try {
      const encrypted = RSAUtils.encrypt(inputText, keys.publicKey);
      setEncryptedData(encrypted);
      setDecryptedText('');
    } catch (error) {
      console.error('Encryption error:', error);
      setDecryptError('Gagal mengenkripsi teks. Pastikan teks hanya menggunakan karakter ASCII standar.');
    }
  };

  const handleDecrypt = () => {
    setDecryptError('');
    setDecryptedText('');

    try {
      if (useManualInput) {
        // Manual decryption
        let encryptedArray: number[];
        const cleanInput = manualEncryptedInput.trim().replace(/^\[|\]$/g, '');
        
        if (!cleanInput) {
          setDecryptError('Data terenkripsi tidak boleh kosong');
          return;
        }

        // Parse encrypted data
        try {
          encryptedArray = cleanInput.split(',').map(str => {
            const num = parseInt(str.trim());
            if (isNaN(num)) throw new Error('Invalid number');
            return num;
          });
        } catch {
          setDecryptError('Format data terenkripsi tidak valid. Contoh: 123, 456, 789');
          return;
        }

        // Validate private key
        const n = parseInt(manualPrivateKeyN.trim());
        const d = parseInt(manualPrivateKeyD.trim());

        if (isNaN(n) || isNaN(d)) {
          setDecryptError('Kunci privat harus berupa angka');
          return;
        }

        if (n <= 0 || d <= 0) {
          setDecryptError('Kunci privat harus lebih besar dari 0');
          return;
        }

        // Perform manual decryption
        const privateKey = { n, d };
        const decrypted = RSAUtils.decrypt(encryptedArray, privateKey);
        setDecryptedText(decrypted);
      } else {
        // Auto decryption using current session data
        if (!encryptedData.length || !keys) return;
        const decrypted = RSAUtils.decrypt(encryptedData, keys.privateKey);
        setDecryptedText(decrypted);
      }
    } catch (error) {
      setDecryptError('Terjadi error saat dekripsi. Periksa kembali data dan kunci yang dimasukkan.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetData = () => {
    setInputText('');
    setEncryptedData([]);
    setDecryptedText('');
    setUseManualInput(false);
    setManualEncryptedInput('');
    setManualPrivateKeyN('');
    setManualPrivateKeyD('');
    setDecryptError('');
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 sm:space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RSA Encryption Demo
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
            aplikasi sederhana algoritma RSA untuk enkripsi dan dekripsi teks dari kelompok 4 PSM24A
            RSA menggunakan sepasang kunci (publik dan privat) untuk mengamankan data.
          </p>
        </motion.div>

        {/* Key Generation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Kunci RSA
              </CardTitle>
              <CardDescription>
                Kunci publik untuk enkripsi dan kunci privat untuk dekripsi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
                <Button 
                  onClick={generateKeys} 
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isGenerating ? 'Generating...' : 'Generate Kunci Baru'}</span>
                  <span className="sm:hidden">{isGenerating ? 'Generating...' : 'Generate Kunci'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowKeys(!showKeys)}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="hidden sm:inline">{showKeys ? 'Sembunyikan' : 'Tampilkan'} Kunci</span>
                  <span className="sm:hidden">{showKeys ? 'Hide' : 'Show'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetData}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-none text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300 hover:bg-orange-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset Data</span>
                  <span className="sm:hidden">Reset</span>
                </Button>
                {keys && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const isValid = RSAUtils.validateKeys(keys.publicKey, keys.privateKey);
                      setDecryptError(isValid ? '' : 'Kunci tidak valid! Generate kunci baru.');
                      if (isValid) {
                        // Show success message briefly
                        const originalError = decryptError;
                        setDecryptError('✓ Kunci valid dan siap digunakan');
                        setTimeout(() => setDecryptError(originalError), 2000);
                      }
                    }}
                    className="flex items-center justify-center gap-2 flex-1 sm:flex-none text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Test Kunci</span>
                    <span className="sm:hidden">Test</span>
                  </Button>
                )}
              </div>

              {keys && showKeys && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2 text-sm sm:text-base">🔓 Kunci Publik (untuk enkripsi)</h4>
                      <div className="space-y-1 text-xs sm:text-sm font-mono bg-white p-3 rounded border">
                        <div className="break-all">n = {keys.publicKey.n}</div>
                        <div className="break-all">e = {keys.publicKey.e}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-red-600 mb-2 text-sm sm:text-base">🔒 Kunci Privat (untuk dekripsi)</h4>
                      <div className="space-y-1 text-xs sm:text-sm font-mono bg-white p-3 rounded border">
                        <div className="break-all">n = {keys.privateKey.n}</div>
                        <div className="break-all">d = {keys.privateKey.d}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 p-3 bg-blue-50 rounded space-y-1">
                    <div><strong>Info:</strong> p = {keys.p}, q = {keys.q} (bilangan prima yang digunakan)</div>
                    <div><strong>Ukuran kunci:</strong> n = {keys.publicKey.n} (harus &gt; 127 untuk ASCII)</div>
                    <div><strong>Status:</strong> <span className="text-green-600">✓ Kunci valid untuk enkripsi ASCII</span></div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Encryption/Decryption Interface */}
        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Encryption */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Lock className="h-5 w-5" />
                  Enkripsi
                </CardTitle>
                <CardDescription>
                  Masukkan teks untuk dienkripsi menggunakan kunci publik
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Teks Asli:</label>
                  <Textarea
                    placeholder="Masukkan pesan yang akan dienkripsi..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={3}
                    className="text-sm sm:text-base"
                  />
                </div>
                <Button 
                  onClick={handleEncrypt} 
                  disabled={!inputText || !keys}
                  className="w-full bg-green-600 hover:bg-green-700 h-11 sm:h-10"
                >
                  🔒 <span className="hidden sm:inline">Enkripsi Teks</span><span className="sm:hidden">Enkripsi</span>
                </Button>
                {encryptedData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium">Hasil Enkripsi:</label>
                    <div className="p-3 bg-green-50 rounded-lg border">
                      <div className="text-xs sm:text-sm font-mono break-all text-green-800">
                        [{encryptedData.join(', ')}]
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(encryptedData.join(', '))}
                        className="flex-1 sm:flex-none"
                      >
                        📋 Copy
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Decryption */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Unlock className="h-5 w-5" />
                  Dekripsi
                </CardTitle>
                <CardDescription>
                  Dekripsi data menggunakan kunci privat (otomatis atau manual)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Toggle Mode */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium">Mode:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={!useManualInput ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setUseManualInput(false);
                        setDecryptError('');
                      }}
                      className="text-xs"
                    >
                      Otomatis
                    </Button>
                    <Button
                      variant={useManualInput ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setUseManualInput(true);
                        setDecryptError('');
                      }}
                      className="text-xs"
                    >
                      Manual
                    </Button>
                  </div>
                </div>

                {/* Data Input Section */}
                {!useManualInput ? (
                  // Auto mode - show current encrypted data
                  <div>
                    <label className="block text-sm font-medium mb-2">Data Terenkripsi (Otomatis):</label>
                    <div className="p-3 bg-gray-50 rounded-lg border min-h-[76px] flex items-center">
                      {encryptedData.length > 0 ? (
                        <span className="text-xs sm:text-sm font-mono text-gray-600 break-all">
                          [{encryptedData.join(', ')}]
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs sm:text-sm">Belum ada data terenkripsi</span>
                      )}
                    </div>
                  </div>
                ) : (
                  // Manual mode - input fields
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Data Terenkripsi (Manual):</label>
                        {encryptedData.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setManualEncryptedInput(encryptedData.join(', '));
                              setDecryptError('');
                            }}
                            className="text-xs"
                          >
                            📥 Gunakan Data Saat Ini
                          </Button>
                        )}
                      </div>
                      <Textarea
                        placeholder="Masukkan data terenkripsi (contoh: 123, 456, 789)"
                        value={manualEncryptedInput}
                        onChange={(e) => {
                          setManualEncryptedInput(e.target.value);
                          setDecryptError('');
                        }}
                        rows={2}
                        className="text-sm font-mono"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: angka dipisah koma
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Kunci Privat (Manual):</label>
                        {keys && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setManualPrivateKeyN(keys.privateKey.n.toString());
                              setManualPrivateKeyD(keys.privateKey.d.toString());
                              setDecryptError('');
                            }}
                            className="text-xs"
                          >
                            📝 Gunakan Kunci Saat Ini
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="n (contoh: 3127)"
                          value={manualPrivateKeyN}
                          onChange={(e) => {
                            setManualPrivateKeyN(e.target.value);
                            setDecryptError('');
                          }}
                          className="font-mono text-sm"
                        />
                        <Input
                          placeholder="d (contoh: 1019)"
                          value={manualPrivateKeyD}
                          onChange={(e) => {
                            setManualPrivateKeyD(e.target.value);
                            setDecryptError('');
                          }}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Decrypt Button */}
                <Button 
                  onClick={handleDecrypt} 
                  disabled={
                    useManualInput 
                      ? (!manualEncryptedInput || !manualPrivateKeyN || !manualPrivateKeyD)
                      : (!encryptedData.length || !keys)
                  }
                  className="w-full bg-red-600 hover:bg-red-700 h-11 sm:h-10"
                >
                  🔓 <span className="hidden sm:inline">Dekripsi Data</span><span className="sm:hidden">Dekripsi</span>
                </Button>

                {/* Error Display */}
                {decryptError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-700">
                      {decryptError}
                    </div>
                  </motion.div>
                )}

                {/* Success Result */}
                {decryptedText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium">Hasil Dekripsi:</label>
                    <div className="p-3 bg-red-50 rounded-lg border">
                      <div className="text-red-800 font-medium text-sm sm:text-base break-words">
                        "{decryptedText}"
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(decryptedText)}
                        className="flex-1 sm:flex-none"
                      >
                        📋 Copy
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>



        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>🔍 Cara Kerja RSA</CardTitle>
              <CardDescription>
                Penjelasan singkat tentang algoritma RSA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">1. Generate Kunci</div>
                  <div className="text-xs sm:text-sm text-blue-700">
                    Pilih dua bilangan prima (p, q), hitung n = p × q dan φ(n) = (p-1)(q-1).
                    Pilih e dan hitung d sebagai inverse dari e mod φ(n).
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="font-semibold text-green-800 mb-2 text-sm sm:text-base">2. Enkripsi</div>
                  <div className="text-xs sm:text-sm text-green-700">
                    Untuk setiap karakter dengan kode ASCII m, 
                    hitung ciphertext c = m^e mod n menggunakan kunci publik (n, e).
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-red-50 rounded-lg md:col-span-2 lg:col-span-1">
                  <div className="font-semibold text-red-800 mb-2 text-sm sm:text-base">3. Dekripsi</div>
                  <div className="text-xs sm:text-sm text-red-700">
                    Untuk setiap ciphertext c, 
                    hitung plaintext m = c^d mod n menggunakan kunci privat (n, d).
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}