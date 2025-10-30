import Realm from "realm";

const schemas = [
  {
    name: "PostAssismentData",
    primaryKey: "id",
    properties: {
      id: "string",
      item: "string",
      createdDateTime: "string",
    },
  },
  {
    name: "assessmentData",
    primaryKey: "id",
    properties: {
      id: "string",
      item: "string",
      createdDateTime: "string",
    },
  },
  {
    name: "hangOutData",
    primaryKey: "id",
    properties: {
      id: "string",
      item: "string",
      createdDateTime: "string",
    },
  },
  {
    name: "HangOutLike",
    primaryKey: "id",
    properties: {
      id: "string",
      item: "string",
      createdDateTime: "string",
    },
  },
  {
    name: "HangOutComment",
    primaryKey: "id",
    properties: {
      id: "string",
      item: "string",
      createdDateTime: "string",
    },
  },
  {
    name: "HangOutPost",
    primaryKey: "id",
    properties: {
      id: "string",
      item: "string",
      createdDateTime: "string",
    },
  },
  {
    name: "AnnouncementGet",
    primaryKey: "id",
    properties: {
      id: "string",
      item: "string",
      createdDateTime: "string",
    },
  },
];

const defaultPath = "./UserDatabase.realm";

let realmInstance;

// Create or reuse a Realm instance
const createRealmInstance = (path = "UserDatabase.realm") => {
  if (!realmInstance) {
    realmInstance = new Realm({ schema: schemas, path: "UserDatabase.realm" });
  }
  return realmInstance;
};

const RealmService = {
  getAllData: (dbName, path = "UserDatabase.realm") => {
    try {
      const realm = createRealmInstance(path);
      return realm.objects(dbName);
    } catch (error) {
      console.error(`Error retrieving data from ${dbName}:`, error);
      throw error;
    }
  },

  addOrUpdateData: (dbName, data, path = "UserDatabase.realm") => {
    try {
      const realm = createRealmInstance(path);

      realm.write(() => {
        const dataArray = Array.isArray(data) ? data : [data];
        const existingData = realm.objects(dbName);

        const existingMap = new Map(
          existingData.map((data) => [data.id, JSON.parse(data.item)])
        );

        const filteredData = dataArray.filter((incomingItem) => {
          const existingItem = existingMap.get(incomingItem.id);
          if (existingItem) {
            try {
              return (
                JSON.stringify(existingItem) !== JSON.stringify(incomingItem)
              );
            } catch (parseError) {
              console.warn(`Error parsing item for comparison: ${parseError}`);
              return true; // Update if parsing fails
            }
          }
          return true; // New item
        });

        filteredData.forEach((item) => {
          const id =
            item.id || `temp_${Math.random().toString(36).substr(2, 9)}`;
          realm.create(
            dbName,
            {
              id,
              item: JSON.stringify(item),
              createdDateTime: new Date().toISOString(),
            },
            Realm.UpdateMode.Modified
          );
        });
      });
    } catch (error) {
      console.error(`Error adding/updating data in ${dbName}:`, error);
      throw error;
    }
  },

  deleteData: (dbName, id, path = "UserDatabase.realm") => {
    try {
      const realm = createRealmInstance(path);

      realm.write(() => {
        const existingData = realm.objects(dbName).filtered(`id == "${id}"`);
        if (existingData.length > 0) {
          realm.delete(existingData);
        } else {
        }
      });
    } catch (error) {
      console.error(`Error deleting data with id ${id} from ${dbName}:`, error);
      throw error;
    }
  },

  deleteAllData: (dbName, path = "UserDatabase.realm") => {
    try {
      const realm = createRealmInstance(path);

      realm.write(() => {
        const allData = realm.objects(dbName);
        if (allData.length > 0) {
          realm.delete(allData);
        } else {
        }
      });
    } catch (error) {
      console.error(`Error deleting all data from ${dbName}:`, error);
      throw error;
    }
  },

  updateData: (dbName, id, updatedFields, path = "UserDatabase.realm") => {
    try {
      const realm = createRealmInstance(path);

      realm.write(() => {
        const existingData = realm.objects(dbName).filtered(`id == "${id}"`);

        if (existingData.length > 0) {
          let item = existingData[0]; // Get the first matching item
          let parsedItem = JSON.parse(item.item); // Parse stored JSON

          // ✅ Update only specified fields
          Object.keys(updatedFields).forEach((key) => {
            parsedItem[key] = updatedFields[key];
          });

          // ✅ Save back the updated item
          item.item = JSON.stringify(parsedItem);

        } else {
        }
      });
    } catch (error) {
      throw error;
    }
  },
};

export default RealmService;
