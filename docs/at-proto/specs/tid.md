Timestamp Identifiers (TIDs)
A TID ("timestamp identifier") is a compact string identifier based on an integer timestamp. They are sortable, appropriate for use in web URLs, and useful as a "logical clock" in networked systems. TIDs are currently used in atproto as record keys and for repository commit "revision" numbers.

Note: There are similarities to "snowflake identifiers". In the decentralized context of atproto, the global uniqueness of TIDs can not be guaranteed, and an antagonistic repo controller could trivially create records re-using known TIDs.

TID Structure
The high-level semantics of a TID are:

64-bit integer
big-endian byte ordering
encoded as base32-sortable. That is, encoded with characters 234567abcdefghijklmnopqrstuvwxyz
no special padding characters (like =) are used, but all digits are always encoded, so length is always 13 ASCII characters. The TID corresponding to integer zero is 2222222222222.
The layout of the 64-bit integer is:

The top bit is always 0
The next 53 bits represent microseconds since the UNIX epoch. 53 bits is chosen as the maximum safe integer precision in a 64-bit floating point number, as used by Javascript.
The final 10 bits are a random "clock identifier."
TID generators should generate a random clock identifier number, chosen to avoid collisions as much as possible (for example, between multiple worker instances of a PDS service cluster). A local clock can be used to generate the timestamp itself. Care should be taken to ensure the TID output stream is monotonically increasing and never repeats, even if multiple TIDs are generated in the same microsecond, or during "clock smear" or clock synchronization incidents. If the local clock has only millisecond precision, the timestamp should be padded. (You can do this by multiplying by 1000.)
