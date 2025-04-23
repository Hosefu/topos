import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { closeModal } from '../../store/uiSlice';

// Импортируем модальные окна
import CreateReservationModal from './CreateReservationModal';
import ConfirmCancelReservationModal from './ConfirmCancelReservationModal';

// Маппинг типов модальных окон к компонентам
const MODAL_COMPONENTS = {
  createReservation: CreateReservationModal,
  confirmCancelReservation: ConfirmCancelReservationModal,
};

const ModalContainer = () => {
  const dispatch = useDispatch();
  const { modalOpen, modalType, modalProps } = useSelector(state => state.ui);

  // Если нет типа или модальное окно закрыто, ничего не рендерим
  if (!modalType || !modalOpen) {
    return null;
  }

  // Получаем компонент для текущего типа модального окна
  const ModalComponent = MODAL_COMPONENTS[modalType];

  // Если компонент не найден, возвращаем null
  if (!ModalComponent) {
    console.error(`Modal component for type ${modalType} not found.`);
    return null;
  }

  // Закрываем модальное окно
  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <Transition.Root show={modalOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={handleClose}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* Этот элемент используется для центрирования модального окна */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleClose}
                >
                  <span className="sr-only">Закрыть</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              {/* Передаем пропсы и функцию закрытия в компонент модального окна */}
              <ModalComponent {...modalProps} onClose={handleClose} />
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ModalContainer;