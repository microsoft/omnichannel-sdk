import IPosition from "../Interfaces/IPosition";
import Location from "../Model/Location";

// Ported from https://dev.azure.com/dynamicscrm/OneCRM/_git/CRM.OmniChannel.LiveChatWidget?path=/src/LiveChatLoader/Utility/LocationInfo.ts&version=GBrelease

export class LocationInfo {
  public static getLocationInfo(): Promise<Location> {
    return new Promise(async (resolve) => {
      if (!navigator.geolocation) {
        console.error("Location is not supported");
        const location = new Location();
        resolve(location);
      } else {
        const location = await LocationInfo.getLocation();
        resolve(location);
      }
    });
  }

  public static getLocation(): Promise<Location> {
    return new Promise((resolve) => {
      const location = new Location();

      // Wait for the user to grant permission
      const onSuccess = (position: IPosition) => {
        location.latitude = position.coords.latitude.toString();
        location.longitude = position.coords.longitude.toString();
        resolve(location);
      };

      const onError = () => {
        resolve(location);
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    });
  }
}
