const CustomForm = ({ handleCloseModal }) => {
    /* Form state and handlers */
  
    const handleSetSchedule = () => {
      /* Handle form submission */
      handleCloseModal();
    };
  
    return (
      <div>
        {/* Form elements */}
        <button
          className="button"
          style={{ width: "100%" }}
          onClick={handleSetSchedule}
        >
          Definir
        </button>
      </div>
    );
  };
  
  export default CustomForm;
  