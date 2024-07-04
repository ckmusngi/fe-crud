import React, { useEffect, useMemo, useState } from 'react'
import ReactTable from '../../common/table'
import { Button, Form, InputGroup, Modal } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';
import TablePagination from '../../common/pagination';
import { Oval } from 'react-loader-spinner';

function Dashboard() {
    const [data, setData] = useState([]);
    const [show, setShow] = useState(false);
    const [customer, setCustomer] = useState([]);
    const [status, setStatus] = useState('CREATE')
    const URL = 'http://localhost:8000/api'
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPageUrl, setLastPageUrl] = useState();
    const [prevPageUrl, setPrevPageUrl] = useState();
    const [nextPageUrl, setNextPageUrl] = useState();
    const [firstPageUrl, setFirstPageUrl] = useState();
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getCustomers(`${URL}/customers`)
    }, [customer])

    const getCustomers = async (url) => {
        await axios.get(url).then((res) => {
            if (res.data.status === 200) {
                let pageItems = [];
                for (let index = 0; index < res.data.data.last_page; index++) {
                    pageItems.push(index + 1);
                }

                setIsLoading(false)
                setPages(pageItems);
                setData(res.data.data.data)
                setCurrentPage(res.data.data.current_page);
                setFirstPageUrl(res.data.data.first_page_url);
                setNextPageUrl(res.data.data.next_page_url);
                setPrevPageUrl(res.data.data.prev_page_url);
                setLastPageUrl(res.data.data.last_page_url);
            }
        }).catch(err => {
            console.log(err);
        })
    }

    const columns = useMemo(
        () => [
          { id:'first_name', Header: "First Name", accessor: "first_name" },
          { id:'last_name', Header: "Last Name", accessor: "last_name" },
          { id:'email_address', Header: "Email", accessor: "email_address" },
          { id:'contact_number', Header: "Contact", accessor: "contact_number" },
          { id:'button', Header: "", Cell: ({row}) => (
            <div>
                <Button style={{margin: '5px'}} variant='secondary' onClick={() => {handleShowModal(row.original); setStatus('UPDATE')}}>Edit</Button>
                <Button style={{margin: '5px'}} variant='danger' onClick={() => {handleDelete(row.original)}}>Delete</Button>
            </div>
            )},
        ],
        []
    );

    function handlePageChange(page) {
        return getCustomers(`${URL}/customers?page=${page}`);
    }

    function handleFirst() {
        if (firstPageUrl !== null) return getCustomers(firstPageUrl);
    }

    function handlePrev() {
        if (prevPageUrl !== null) return getCustomers(prevPageUrl);
    }

    function handleNext() {
        if (nextPageUrl !== null) return getCustomers(nextPageUrl);
    }

    function handleLast() {
        if (lastPageUrl !== null) return getCustomers(lastPageUrl);
    }

    const handleDelete = async (data) => {
        setCustomer(data);
        await axios.delete(`${URL}/customers/${data.id}`).then(res => {
            if (res.data.status === 200) {
                setCustomer([]);
                Swal.fire({
                    title: res.data.message,
                    icon: "success"
                });
                return true;
            }
        }).catch(err => {
            Swal.fire({
                text: err,
                icon: "error"
            });
        })
    }

    const handleSubmit = async () => {
        if (status === 'CREATE') {
            await axios.post(`${URL}/customers`, customer).then(res => {
                if (res.data.status === 200) {
                    setCustomer([]);
                    setShow(false)
                    Swal.fire({
                        title: res.data.message,
                        icon: "success"
                    });
                    return true;
                } else {
                    Swal.fire({
                        title: res.data.message,
                        icon: "success"
                    }); 
                }
            }).catch(err => {
                Swal.fire({
                    text: err,
                    icon: "error"
                });
            })

            return true;
        }
        
        await axios.put(`${URL}/customers/${customer.id}`, customer).then(res => {
            setShow(false)
            setCustomer([]);
            if (res.data.status === 200) {
                Swal.fire({
                    title: res.data.message,
                    icon: "success"
                });
                
                return true;
            } 
        }).catch(err => {
            Swal.fire({
                text: err,
                icon: "error"
            });
        })
    }

    const handleOnchange = (event) => {
        setCustomer({
            ...customer,
            [event.target.name]: event.target.value
        });
    }

    const handleShowModal = (customer) => {
        setShow(true)
        setCustomer(customer);
    };
    const handleClose = () => setShow(false);

  return (
    <div>
        <div className='container' style={{display: 'flex', justifyContent: 'right', marginTop: '10px'}}>
            <Button className='createButton' variant="primary" onClick={() => {
                setShow(true);
                setStatus('CREATE')
            }}>CREATE</Button>
        </div>
        {isLoading ? (
                <div className='container' style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px'}}>
                    <Oval color='#fff' height={80} width={80} />
                </div>
            ) : data.length > 0 ? (
                <>
                    <ReactTable columns={columns} data={data}/>
                    <TablePagination
                        handlePageChange={handlePageChange}
                        handleFirst={handleFirst}
                        handlePrev={handlePrev}
                        handleNext={handleNext}
                        handleLast={handleLast}
                        pages={pages}
                        currentPage={currentPage}
                    />
                </>
            ) : (
                <span>No data available</span>
            )}
        
        
        <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>{status === 'CREATE' ? 'CREATE' : 'UPDATE'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <div className='headerContainer'>
                    <h5>Information</h5>
                </div>
                
                <div className='groupedFields'>
                    <Form.Group>
                        <Form.Label>First name</Form.Label>
                        <Form.Control className='textField' name='first_name' type="text" value = { customer.first_name } onChange = { (event) => { handleOnchange(event) } }/>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Last name</Form.Label>
                        <Form.Control className='textField' name='last_name' type="text" value = { customer.last_name } onChange = { (event) => { handleOnchange(event) } }/>
                    </Form.Group>
                </div>

                <Form.Group className='fieldItem'>
                    <Form.Label>Email</Form.Label>
                    <Form.Control className='textField' name='email_address' type="text" value = { customer.email_address } onChange = { (event) => { handleOnchange(event) } }/>
                </Form.Group>

                <Form.Group className='fieldItem'>
                    <Form.Label>Contact #</Form.Label>
                    <Form.Control className='textField' name='contact_number' type="text" value = { customer.contact_number } onChange = { (event) => { handleOnchange(event) } }/>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {status === 'CREATE' ? 'Create' : 'Update'}
          </Button>
        </Modal.Footer>
      </Modal>
        {/* <div className='container' style={{display: 'flex', justifyContent: 'left'}}>
            <TablePagination
                handlePageChange={handlePageChange}
                handleFirst={handleFirst}
                handlePrev={handlePrev}
                handleNext={handleNext}
                handleLast={handleLast}
                pages={pages}
                currentPage={currentPage}
            />
        </div> */}
      
    </div>
  )
}

export default Dashboard