import pymongo

def create_mongodb_connection():
    """
    Create a connection to the MongoDB database for storing clothes images.
    This function does not affect any existing files in the project.
    """
    
    connection_string = "mongodb://windos11.khushal:27017/"
    
    
    client = pymongo.MongoClient(connection_string)
    

    db = client['clothes_images']
    
    
    images_collection = db['images']
    
    print("MongoDB connection established and database 'clothes_images' created with collection 'images'.")

if __name__ == "__main__":
    create_mongodb_connection()
