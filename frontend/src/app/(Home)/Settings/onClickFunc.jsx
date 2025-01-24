
import Services from './services';
import toast from 'react-hot-toast';
// import Services from './services';

export const sendCode = async() => 
    {
  
      try {
        
        const result = await Services.sendCodeService();


          if(result.statusText === 'OK') {
            const successMsg = 'Email sent successfully!';
            toast.success(successMsg);//
            return;
          }
          else {
            throw new Error (result);
          }
          

  
      }
  
      catch (error) {
        console.log("sendCode http request failed; ", error);
      }
      setError('');
    }

export    const handleVerify = async(code, setError) => {
        
        if (!code.trim()) {
          setError('Please enter the security code.');
          return;
        }
        if (code.length < 6) {
          setError('Please enter a valid security code.');
          return;
        } 



        try {
            const result = await Services.handleVerifyService(code);

            
                const successMsg = result.data.message;
                if(successMsg === '2fa is done') {

                  toast.success('Operation done successfuly!');
                  // setRefreshKey(prev => prev + 1);
                  setTimeout(() => { window.location.reload(); }, 1000);
                }

                else {

                  toast.error('Invalide Code !');
                    throw new Error (result)
                  

                }


                
            
        }
        catch (error) {
          console.log("handleVerify http request failed; ", error);
        }

          
          setError('');
        
      };




    