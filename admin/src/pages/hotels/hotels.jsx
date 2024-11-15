import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [newHotel, setNewHotel] = useState({
    name: "",
    city: "",
    address: "",
    desc: "",
    rating: "",
    cheapestPrice: "",
    // type
    // photos:[],
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [hotelTypes, setHotelTypes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get("http://localhost:8800/api/hotels");
      const hotelsData = response.data;
      console.log("Dữ liệu khách sạn:", hotelsData);

      const hotelsWithImages = await Promise.all(
        hotelsData.map(async (hotel) => {
          console.log("Hotel photos ID:", hotel.photos);

          if (hotel.photos) {
            try {
              const imageResponse = await axios.get(
                `http://localhost:8800/api/images/${hotel.photos}`
              );
              hotel.photo_url = `data:image/png;base64,${imageResponse.data}`;
            } catch (error) {
              console.error("Lỗi khi lấy ảnh cho khách sạn:", hotel._id, error);
              hotel.photo_url = null;
            }
          } else {
            hotel.photo_url = null;
          }
          return hotel;
        })
      );

      setHotels(hotelsWithImages);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      console.log("Selected image:", file); // Thêm log để kiểm tra
    } else {
      console.log("Không có ảnh nào được chọn");
    }
  };

  const handleCreate = async () => {
    try {
      if (
        !newHotel.name ||
        !newHotel.city ||
        !newHotel.address ||
        !newHotel.cheapestPrice
      ) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }


      // Bước 1: Tải ảnh lên server
      const formData = new FormData();
      formData.append('image', selectedImage);
      const imageResponse = await axios.post("http://localhost:8800/api/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(imageResponse.data);
      // Tạo khách sạn với ID ảnh
      const newHotelData = {
        ...newHotel,
        photos: imageResponse.data._id, // Giả sử server trả về ID của ảnh đã lưu
      };


      const response = await axios.post(
        "http://localhost:8800/api/hotels",
        newHotelData
      );

      setHotels([...hotels, response.data]);

      setNewHotel({
        name: "",
        city: "",
        address: "",
        desc: "",
        rating: "",
        cheapestPrice: "",
        type: "",
        photos: null,
      });
      setShowAddForm(false);

      alert("Thêm khách sạn thành công!");
    } catch (error) {
      console.error("Error creating hotel:", error);
      alert("Có lỗi xảy ra khi thêm khách sạn: " + error.message);
    }
  };
  const handleHotelClick = (hotelId) => {
    // Chuyển hướng đến trang rooms với hotelId
    // Ngăn chặn sự kiện lan truyền
    console.log("Navigating to hotel:", hotelId); // Debug log
    navigate(`/rooms/${hotelId}`);
  };
  const handleUpdate = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:8800/api/hotels/${id}`,
        editingHotel
      );
      setHotels(
        hotels.map((hotel) => (hotel._id === id ? response.data : hotel))
      );
      closeEditModal();
      alert("Cập nhật khách sạn thành công!");
    } catch (error) {
      console.error("Error updating hotel:", error);
      alert("Có lỗi xảy ra khi cập nhật khách sạn: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/api/hotels/${id}`);
      setHotels(hotels.filter((hotel) => hotel._id !== id)); // Xóa khách sạn khỏi danh sách
    } catch (error) {
      console.error("Error deleting hotel:", error);
    }
  };

  const startEditing = (hotel) => {
    setEditingHotel(hotel);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingHotel(null);
    setIsEditModalOpen(false);
  };

  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-center mb-12 px-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold font-['Poppins'] leading-tight text-black">
            Danh Sách Khách Sạn
          </h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            {showAddForm ? "Hủy" : "+ Thêm Khách Sạn"}
          </button>
        </div>

        {/* Form thêm khách sạn */}
        {showAddForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Tên khách sạn"
                  value={newHotel.name}
                  onChange={(e) =>
                    setNewHotel({ ...newHotel, name: e.target.value })
                  }
                  className="p-2 border rounded-md"
                />
                {/* <input
                                    type="text"
                                    placeholder="Thành phố"
                                    value={newHotel.city}
                                    onChange={(e) => setNewHotel({...newHotel, city: e.target.value})}
                                    className="p-2 border rounded-md"
                                />
                                 */}
                <input
                  type="text"
                  placeholder="Thành phố"
                  value={newHotel.city}
                  onChange={(e) =>
                    setNewHotel({ ...newHotel, city: e.target.value })
                  }
                  className="p-2 border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Địa chỉ"
                  value={newHotel.address}
                  onChange={(e) =>
                    setNewHotel({ ...newHotel, address: e.target.value })
                  }
                  className="p-2 border rounded-md"
                />
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  placeholder="Đánh giá (1-5)"
                  value={newHotel.rating}
                  onChange={(e) =>
                    setNewHotel({ ...newHotel, rating: e.target.value })
                  }
                  className="p-2 border rounded-md"
                  min="1"
                  max="5"
                />
                <input
                  type="number"
                  placeholder="Giá rẻ nhất"
                  value={newHotel.cheapestPrice}
                  onChange={(e) =>
                    setNewHotel({ ...newHotel, cheapestPrice: e.target.value })
                  }
                  className="p-2 border rounded-md"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}

                  className="p-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <textarea
                  placeholder="Mô tả"
                  value={newHotel.desc}
                  onChange={(e) =>
                    setNewHotel({ ...newHotel, desc: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  rows="3"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={handleCreate}
                  Thêm
                  Khách
                  Sạn
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Thêm Khách Sạn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form chỉnh sửa khách sạn */}
        {isEditModalOpen && editingHotel && (
          <div style={modalStyles.overlay} onClick={closeEditModal}>
            <div
              className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Chỉnh sửa khách sạn</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Tên khách sạn"
                    value={editingHotel.name}
                    onChange={(e) =>
                      setEditingHotel({ ...editingHotel, name: e.target.value })
                    }
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Thành phố"
                    value={editingHotel.city}
                    onChange={(e) =>
                      setEditingHotel({ ...editingHotel, city: e.target.value })
                    }
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Thành phố"
                    value={editingHotel.city}
                    onChange={(e) =>
                      setEditingHotel({ ...editingHotel, city: e.target.value })
                    }
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Địa chỉ"
                    value={editingHotel.address}
                    onChange={(e) =>
                      setEditingHotel({
                        ...editingHotel,
                        address: e.target.value,
                      })
                    }
                    className="p-2 border rounded-md"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="number"
                    placeholder="Đánh giá (1-5)"
                    value={editingHotel.rating}
                    onChange={(e) =>
                      setEditingHotel({
                        ...editingHotel,
                        rating: e.target.value,
                      })
                    }
                    className="p-2 border rounded-md"
                    min="1"
                    max="5"
                  />
                  <input
                    type="number"
                    placeholder="Giá rẻ nhất"
                    value={editingHotel.cheapestPrice}
                    onChange={(e) =>
                      setEditingHotel({
                        ...editingHotel,
                        cheapestPrice: e.target.value,
                      })
                    }
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append("image", file);
                        try {
                          const response = await axios.post(
                            "http://localhost:8800/api/upload",
                            formData,
                            {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            }
                          );
                          setEditingHotel({
                            ...editingHotel,
                            photos: response.data._id,
                          });
                        } catch (error) {
                          console.error("Error uploading image:", error);
                        }
                      }
                    }}
                    className="p-2 border rounded-md"
                  />
                </div>
                <div className="md:col-span-2">
                  <textarea
                    placeholder="Mô tả"
                    value={editingHotel.desc}
                    onChange={(e) =>
                      setEditingHotel({ ...editingHotel, desc: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                    rows="3"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button
                    onClick={closeEditModal}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleUpdate(editingHotel._id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="Room w-full max-w-full mx-auto px-2 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-8 auto-rows-fr">
            {hotels.map((hotel) => (
            
              <div
                key={hotel._id}
                className="Room-1 flex-col justify-start items-start gap-2 flex px-2"

              >
                <div className="flex flex-col items-center h-full w-full">
                  <img
                    className="Image h-60 relative w-full object-cover rounded-lg"
                    src={`http://localhost:8800/api/images/${hotel.photos}`}
                    alt="Uploaded Image"
                    onClick={() => handleHotelClick(hotel._id)}
                  />

                  <div className="Name text-[#1a1a1a] text-xl font-semibold font-['Inter'] leading-loose text-center w-full">
                    {hotel.name}
                  </div>

                  {/* Loại khách sạn */}
                  <div className="Type flex items-center gap-2 text-[#1a1a1a] font-['Inter'] w-full">
                    <span className="font-semibold">Loại khách sạn:</span>
                    <span>{hotelTypes[hotel.type] || "Đang cập nhật"}</span>
                  </div>

                  {/* Thành phố */}
                  <div className="City flex items-center gap-2 text-[#1a1a1a] font-['Inter'] w-full">
                    <span className="font-semibold">Thành phố:</span>
                    <span>{hotel.city}</span>
                  </div>

                  {/* Địa chỉ */}
                  <div className="Address flex items-center gap-2 text-[#1a1a1a] font-['Inter'] w-full">
                    <span className="font-semibold">Địa chỉ:</span>
                    <span>{hotel.address}</span>
                  </div>

                  {/* Đánh giá */}
                  <div className="Rating flex items-center gap-2 text-[#1a1a1a] font-['Inter'] w-full">
                    <span className="font-semibold">Đánh giá:</span>
                    <span className="text-yellow-500">
                      {"★".repeat(Math.floor(hotel.rating))}
                      {"☆".repeat(5 - Math.floor(hotel.rating))}
                    </span>
                    <span>({hotel.rating}/5)</span>
                  </div>

                  {/* Giá rẻ nhất */}
                  <div className="LowestPrice flex items-center gap-2 text-[#1a1a1a] font-['Inter'] w-full">
                    <span className="font-semibold">Giá từ:</span>
                    <span className="text-blue-600 font-semibold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(hotel.cheapestPrice)}
                      /đêm
                    </span>
                  </div>

                  {/* Mô tả */}
                  <div className="Mo-ta text-[#667084] text-base font-normal font-['Inter'] leading-relaxed overflow-hidden flex-grow mt-2">
                    <span className="font-semibold">Mô tả: </span>
                    <span>{hotel.desc}</span>
                  </div>

                  <div className="flex gap-6 mt-auto pt-4">
                    <button
                      onClick={() => startEditing(hotel)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(hotel._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hotels;
