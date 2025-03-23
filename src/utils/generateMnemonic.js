import { wordarr } from ".";
import { supabase } from "../utils/supabaseClient";

const wordList = wordarr;

if (wordList.length !== 2048) {
  console.error("BIP-39 word list is incorrect!");
}

// Secure Random Bytes (Browser-Compatible)
const getRandomBytes = (size) => {
  const bytes = new Uint8Array(size);
  window.crypto.getRandomValues(bytes);
  return bytes;
};

// Generate a mnemonic phrase
export const generateMnemonic = async (strength = 128) => {
  if (![128, 160, 192, 224, 256].includes(strength)) {
    throw new Error("Strength must be one of [128, 160, 192, 224, 256] bits.");
  }

  const entropy = getRandomBytes(strength / 8);
  const hashBuffer = await crypto.subtle.digest("SHA-256", entropy);
  const hashArray = new Uint8Array(hashBuffer);
  const checksumBits = hashArray[0].toString(2).padStart(8, "0").slice(0, strength / 32);

  const entropyBits = [...entropy].map(byte => byte.toString(2).padStart(8, "0")).join("") + checksumBits;
  const words = [];

  for (let i = 0; i < entropyBits.length; i += 11) {
    words.push(wordList[parseInt(entropyBits.slice(i, i + 11), 2)]);
  }

  return words.join(" ");
};

// Generate batch & store unique mnemonics
export const generateBatchMnemonics = async (batchSize) => {
  let newMnemonics = new Set();
  while (newMnemonics.size < batchSize) {
    newMnemonics.add(await generateMnemonic(128));
  }
  newMnemonics = [...newMnemonics];

  const { data: existingMnemonics, error } = await supabase
    .from("mnemonics")
    .select("mnemonic")
    .in("mnemonic", newMnemonics);

  if (error) {
    console.error("Error fetching mnemonics:", error);
    return;
  }

  const existingSet = new Set(existingMnemonics.map((m) => m.mnemonic));
  const uniqueMnemonics = newMnemonics.filter((m) => !existingSet.has(m));

  if (uniqueMnemonics.length > 0) {
    const { error: insertError } = await supabase.from("mnemonics").insert(
      uniqueMnemonics.map((mnemonic, index) => ({
        mnemonic,
        checked: false,
        has_history: false,
        generated_index: Date.now() + index,
      }))
    );

    if (insertError) console.error("Error saving mnemonics:", insertError);
  } else {
    console.log("No new mnemonics generated (all were duplicates).");
  }
};