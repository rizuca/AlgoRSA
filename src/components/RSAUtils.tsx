// Utilitas untuk algoritma RSA
export class RSAUtils {
  // Fungsi untuk mengecek bilangan prima
  static isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  // Generate bilangan prima acak dalam range
  static generatePrime(min: number, max: number): number {
    const primes: number[] = [];
    for (let i = min; i <= max; i++) {
      if (this.isPrime(i)) {
        primes.push(i);
      }
    }
    if (primes.length === 0) {
      throw new Error(`No prime numbers found in range ${min}-${max}`);
    }
    return primes[Math.floor(Math.random() * primes.length)];
  }

  // Fungsi untuk menghitung GCD (Greatest Common Divisor) menggunakan Extended Euclidean Algorithm
  static gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  // Fungsi untuk menghitung modular inverse menggunakan Extended Euclidean Algorithm
  static modInverse(a: number, m: number): number {
    if (this.gcd(a, m) !== 1) {
      throw new Error('Modular inverse does not exist');
    }
    
    // Extended Euclidean Algorithm
    let m0 = m;
    let x0 = 0;
    let x1 = 1;
    
    if (m === 1) return 0;
    
    while (a > 1) {
      const q = Math.floor(a / m);
      let t = m;
      
      m = a % m;
      a = t;
      t = x0;
      
      x0 = x1 - q * x0;
      x1 = t;
    }
    
    if (x1 < 0) x1 += m0;
    
    return x1;
  }

  // Fungsi untuk modular exponentiation (lebih robust)
  static modPow(base: number, exp: number, mod: number): number {
    if (mod === 1) return 0;
    
    let result = 1;
    base = base % mod;
    
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = (result * base) % mod;
      }
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    
    return result;
  }

  // Generate RSA key pair dengan range bilangan prima yang lebih besar
  static generateKeyPair(): { publicKey: { n: number; e: number }, privateKey: { n: number; d: number }, p: number, q: number } {
    // Gunakan range bilangan prima yang lebih besar untuk keamanan yang lebih baik
    // Range 100-200 akan menghasilkan n antara 10,000 - 40,000 yang cukup untuk ASCII
    const p = this.generatePrime(100, 200);
    let q = this.generatePrime(100, 200);
    
    // Pastikan p dan q berbeda
    while (q === p) {
      q = this.generatePrime(100, 200);
    }

    const n = p * q;
    const phi = (p - 1) * (q - 1);

    // Pilih e yang lebih standar, mulai dari 65537 jika memungkinkan, atau 3
    let e = 65537;
    if (e >= phi || this.gcd(e, phi) !== 1) {
      e = 3;
      while (e < phi && this.gcd(e, phi) !== 1) {
        e += 2;
      }
    }

    // Hitung d (private exponent) menggunakan modular inverse yang diperbaiki
    const d = this.modInverse(e, phi);

    // Validasi kunci yang dihasilkan
    if (n < 256) {
      throw new Error('Generated key size too small for ASCII encryption');
    }

    return {
      publicKey: { n, e },
      privateKey: { n, d },
      p,
      q
    };
  }

  // Enkripsi teks dengan validasi tambahan
  static encrypt(text: string, publicKey: { n: number; e: number }): number[] {
    const encrypted: number[] = [];
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      
      // Validasi bahwa charCode < n untuk memastikan enkripsi/dekripsi yang benar
      if (charCode >= publicKey.n) {
        throw new Error(`Character code ${charCode} is too large for key size ${publicKey.n}`);
      }
      
      const encryptedChar = this.modPow(charCode, publicKey.e, publicKey.n);
      encrypted.push(encryptedChar);
    }
    
    return encrypted;
  }

  // Dekripsi teks dengan validasi tambahan
  static decrypt(encrypted: number[], privateKey: { n: number; d: number }): string {
    let decrypted = '';
    
    for (const num of encrypted) {
      // Validasi input
      if (num < 0 || num >= privateKey.n) {
        throw new Error(`Encrypted value ${num} is invalid for key size ${privateKey.n}`);
      }
      
      const decryptedChar = this.modPow(num, privateKey.d, privateKey.n);
      
      // Validasi bahwa hasil dekripsi adalah karakter ASCII yang valid
      if (decryptedChar < 0 || decryptedChar > 127) {
        throw new Error(`Decrypted character code ${decryptedChar} is not valid ASCII`);
      }
      
      decrypted += String.fromCharCode(decryptedChar);
    }
    
    return decrypted;
  }

  // Fungsi helper untuk validasi kunci
  static validateKeys(publicKey: { n: number; e: number }, privateKey: { n: number; d: number }): boolean {
    try {
      // Test dengan karakter 'A' (ASCII 65)
      const testChar = 65;
      const encrypted = this.modPow(testChar, publicKey.e, publicKey.n);
      const decrypted = this.modPow(encrypted, privateKey.d, privateKey.n);
      return decrypted === testChar;
    } catch (error) {
      return false;
    }
  }
}