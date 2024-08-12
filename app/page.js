'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { deleteDoc, doc, setDoc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { firestore } from "@/firebase"; // Ensure this is properly configured

export default function Home() {
  const [inventory, setInventory] = useState([]); // State to store the fetched inventory data
  const [open, setOpen] = useState(false); // State to manage the modal visibility
  const [itemName, setItemName] = useState(''); // State to store the name of an item to be added

  // Function to fetch inventory data from Firestore
  const updateInventory = async () => {
    try {
      // Query the 'inventory' collection from Firestore
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];

      // Iterate over the documents returned by the query
      docs.forEach((doc) => {
        inventoryList.push({
          name: doc.id, // Use document ID as the item's name
          ...doc.data(), // Spread the rest of the document's data
        });
      });

      // Update the state with the fetched inventory
      setInventory(inventoryList);

    } catch (error) {
      // Log any errors that occur during the fetch process
      console.error("Error fetching inventory: ", error);
    }
  };

  // Function to add an item to the inventory
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item); // Reference to the document
    const docSnap = await getDoc(docRef); // Fetch the document

    if (docSnap.exists()) {
      // If the item already exists, increment the quantity
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
    } else {
      // If the item doesn't exist, create it with quantity 1
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory(); // Refresh the inventory list
  };

  // Function to remove an item from the inventory
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item); // Reference to the document
    const docSnap = await getDoc(docRef); // Fetch the document

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        // If the quantity is 1, delete the document
        await deleteDoc(docRef);
      } else {
        // Otherwise, decrement the quantity
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
    }

    await updateInventory(); // Refresh the inventory list
  };

  // useEffect hook to call updateInventory when the component mounts
  useEffect(() => {
    updateInventory();
  }, []);

  // Functions to handle opening and closing the modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      sx={{
        backgroundImage: 'url("/bg.jpg")', // Add your food-themed background image here
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Modal for adding a new item */}
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{ transform: "translate(-50%, -50%)" }}
          width={400}
          bgcolor="white"
          border="2px solid #00000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName); // Add the item
                setItemName(""); // Clear the input field
                handleClose(); // Close the modal
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Button to open the modal for adding a new item */}
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          backgroundColor: '#FF6347', // Tomato color for a food theme
          color: '#fff',
          '&:hover': {
            backgroundColor: '#FF4500', // Darker tomato color on hover
          },
          padding: '10px 20px',
          borderRadius: '20px',
        }}
      >
        Add New Item
      </Button>

      {/* Box displaying the inventory list */}
      <Box
        border="1px solid #333"
        width="800px"
        bgcolor="rgba(255, 255, 255, 0.8)" // Semi-transparent background for the inventory list
        borderRadius="10px"
      >
        {/* Header */}
        <Box height="100px" bgcolor="#FF6347" display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h2" color='#fff'>
            Inventory Items
          </Typography>
        </Box>

        {/* Stack containing inventory items */}
        <Stack width="100%" spacing={2} overflow="auto" padding={2}>
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={3}
              borderRadius={1}
            >
              {/* Display item name */}
              <Typography variant="h5" color="#333">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              {/* Display item quantity */}
              <Typography variant="h5" color="#333">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={4}>
                {/*Button to add the item */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#FF6347', // Tomato color
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#FF4500',
                    },
                  }}
                  onClick={() => addItem(name)}
                >
                  Add
                </Button>
                {/* Button to remove the item */}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#FF6347',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#FF4500',
                    },
                  }}
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
