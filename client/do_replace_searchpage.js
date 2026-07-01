const fs = require('fs');
const file = 'd:/Kì 5/swp391-rbl-project-team_2/client/src/features/tenant/pages/SearchPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace imports
content = content.replace("import RoomCard from '../components/RoomCard';", "import PropertyCard from '../components/PropertyCard';");
content = content.replace("import { favoriteService } from '../services/favoriteService';\n", "");

// Replace fetchRooms
const fetchRoomsOld = `const fetchRooms = useCallback(async (currentPage = 1, append = false) => {
    try {
      setLoading(true);
      const params = buildSearchParams(currentPage);
      
      const response = await roomService.searchRooms(params);
      
      let favoriteIds = [];
      if (isAuthenticated) {
        try {
          const favResponse = await favoriteService.getFavorites();
          const favs = favResponse.data || favResponse || [];
          favoriteIds = favs.map(f => parseInt(f.room_id) || parseInt(f.roomId));
        } catch (e) {
          console.error("Could not fetch favorites", e);
        }
      }

      const mappedRooms = response.data.map(room => ({
        id: room.roomId,
        title: room.title,
        price: room.pricePerMonth,
        location: [room.address, room.district, room.city].filter(Boolean).join(', '),
        specs: [
          { icon: 'bed', text: \`\${room.bedrooms || 1} Bed\` },
          { icon: 'square', text: \`\${room.areaSqm || 0} m²\` }
        ],
        imageTags: [{ 
          text: room.status === 'available' ? 'Available' : (room.status === 'rented' ? 'Rented' : (room.status === 'maintenance' ? 'Maintenance' : 'Occupied')), 
          type: room.status === 'available' ? 'primary' : (room.status === 'maintenance' ? 'warning' : 'danger') 
        }],
        isFavorite: favoriteIds.includes(parseInt(room.roomId)),
        image: room.thumbnailUrl ? (room.thumbnailUrl && room.thumbnailUrl.startsWith('http') ? room.thumbnailUrl : \`http://localhost:5000\${room.thumbnailUrl}\`) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'
      }));

      if (!append) {
        setRooms(mappedRooms);
      } else {
        setRooms(prev => [...prev, ...mappedRooms]);
      }
      setTotalPages(response.pagination?.pages || 1);
      setPage(currentPage);
    } catch (err) {
      console.error(err);
      if (!append) setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [buildSearchParams, isAuthenticated]);`;

const fetchRoomsNew = `const fetchRooms = useCallback(async (currentPage = 1, append = false) => {
    try {
      setLoading(true);
      const params = buildSearchParams(currentPage);
      
      const response = await roomService.searchProperties(params);
      
      const mappedProperties = response.data.map(prop => ({
        id: prop.id,
        title: prop.title,
        address: prop.address,
        district: prop.district,
        city: prop.city,
        thumbnailUrl: prop.thumbnailUrl ? (prop.thumbnailUrl.startsWith('http') ? prop.thumbnailUrl : \`http://localhost:5000\${prop.thumbnailUrl}\`) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500',
        minPrice: prop.minPrice,
        maxPrice: prop.maxPrice,
        totalRooms: prop.totalRooms,
        availableRooms: prop.availableRooms,
      }));

      if (!append) {
        setRooms(mappedProperties);
      } else {
        setRooms(prev => [...prev, ...mappedProperties]);
      }
      setTotalPages(response.pagination?.pages || 1);
      setPage(currentPage);
    } catch (err) {
      console.error(err);
      if (!append) setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [buildSearchParams]);`;

content = content.replace(fetchRoomsOld, fetchRoomsNew);

// Replace UI text
content = content.replace('<h2 className="text-2xl font-bold">Available Rooms</h2>', '<h2 className="text-2xl font-bold">Available Properties</h2>');

// Replace mapping
const mapOld = `{rooms.length > 0 ? (
                rooms.map(room => (
                  <RoomCard key={room.id} room={room} variant="standard" />
                ))
              ) : (
                !loading && <div className="col-span-full py-12 text-center text-gray-500">No rooms found matching your criteria. Try adjusting your filters.</div>
              )}`;

const mapNew = `{rooms.length > 0 ? (
                rooms.map(prop => (
                  <PropertyCard key={prop.id} property={prop} />
                ))
              ) : (
                !loading && <div className="col-span-full py-12 text-center text-gray-500">No properties found matching your criteria. Try adjusting your filters.</div>
              )}`;

content = content.replace(mapOld, mapNew);

content = content.replace("'Load More Rooms'", "'Load More Properties'");

fs.writeFileSync(file, content);
console.log("SUCCESS");
