
import sys
import hashlib

# Base58 character set
ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

def b58decode(s):
    """
    Decodes the base58-encoded string s into bytes
    """
    n = 0
    for c in s:
        n = n * 58 + ALPHABET.index(c)
    
    # Convert to bytes
    h = hex(n)[2:]
    if len(h) % 2:
        h = '0' + h
    b = bytes.fromhex(h)
    
    # Add leading zeros
    pad = 0
    for c in s:
        if c == ALPHABET[0]:
            pad += 1
        else:
            break
    return b'\x00' * pad + b

def decode_cb58(s):
    decoded = b58decode(s)
    # Remove the last 4 bytes (checksum)
    payload = decoded[:-4]
    return payload.hex()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print("0x" + decode_cb58(sys.argv[1]))
