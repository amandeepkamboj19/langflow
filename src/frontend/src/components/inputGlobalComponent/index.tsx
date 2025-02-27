import { useEffect } from "react";
import { deleteGlobalVariable } from "../../controllers/API";
import DeleteConfirmationModal from "../../modals/DeleteConfirmationModal";
import useAlertStore from "../../stores/alertStore";
import { useGlobalVariablesStore } from "../../stores/globalVariables";
import { ResponseErrorDetailAPI } from "../../types/api";
import { InputGlobalComponentType } from "../../types/components";
import { cn } from "../../utils/utils";
import AddNewVariableButton from "../addNewVariableButtonComponent/addNewVariableButton";
import ForwardedIconComponent from "../genericIconComponent";
import InputComponent from "../inputComponent";
import { CommandItem } from "../ui/command";

export default function InputGlobalComponent({
  disabled,
  onChange,
  setDb,
  name,
  data,
  editNode = false,
}: InputGlobalComponentType): JSX.Element {
  const globalVariablesEntries = useGlobalVariablesStore(
    (state) => state.globalVariablesEntries
  );

  const getVariableId = useGlobalVariablesStore((state) => state.getVariableId);
  const removeGlobalVariable = useGlobalVariablesStore(
    (state) => state.removeGlobalVariable
  );
  const setErrorData = useAlertStore((state) => state.setErrorData);

  useEffect(() => {
    if (data.node?.template[name])
      if (
        !globalVariablesEntries.includes(data.node?.template[name].value) &&
        data.node?.template[name].load_from_db
      ) {
        onChange("");
        setDb(false);
      }
  }, [globalVariablesEntries]);

  function handleDelete(key: string) {
    const id = getVariableId(key);
    if (id !== undefined) {
      deleteGlobalVariable(id)
        .then((_) => {
          removeGlobalVariable(key);
          if (
            data?.node?.template[name].value === key &&
            data?.node?.template[name].load_from_db
          ) {
            onChange("");
            setDb(false);
          }
        })
        .catch((error) => {
          let responseError = error as ResponseErrorDetailAPI;
          setErrorData({
            title: "Error deleting variable",
            list: [responseError.response.data.detail ?? "Unknown error"],
          });
        });
    } else {
      setErrorData({
        title: "Error deleting variable",
        list: [cn("ID not found for variable: ", key)],
      });
    }
  }
  return (
    <InputComponent
      id={"input-" + name}
      editNode={editNode}
      disabled={disabled}
      password={data.node?.template[name].password ?? false}
      value={data.node?.template[name].value ?? ""}
      options={globalVariablesEntries}
      optionsPlaceholder={"Global Variables"}
      optionsIcon="Globe"
      optionsButton={
        <AddNewVariableButton>
          <CommandItem value="doNotFilter-addNewVariable">
            <ForwardedIconComponent
              name="Plus"
              className={cn("mr-2 h-4 w-4 text-primary")}
              aria-hidden="true"
            />
            <span>Add New Variable</span>
          </CommandItem>
        </AddNewVariableButton>
      }
      optionButton={(option) => (
        <DeleteConfirmationModal
          onConfirm={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleDelete(option);
          }}
          description={'variable "' + option + '"'}
          asChild
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="pr-1"
          >
            <ForwardedIconComponent
              name="Trash2"
              className={cn(
                "h-4 w-4 text-primary opacity-0 hover:text-status-red group-hover:opacity-100"
              )}
              aria-hidden="true"
            />
          </button>
        </DeleteConfirmationModal>
      )}
      selectedOption={
        data?.node?.template[name].load_from_db ?? false
          ? data?.node?.template[name].value
          : ""
      }
      setSelectedOption={(value) => {
        onChange(value);
        setDb(value !== "" ? true : false);
      }}
      onChange={(value) => {
        onChange(value);
        setDb(false);
      }}
    />
  );
}
