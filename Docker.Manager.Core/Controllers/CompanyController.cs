using Arch.EntityFrameworkCore.UnitOfWork;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Docker.Manager.Model.Base;
using Docker.Manager.Model.Dto;
using Dockify.Model.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Docker.Manager.Core.Controllers
{
    [Produces("application/json")]
    [Route("company")]
    [EnableCors("teknopalasPolicy")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class CompanyController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<CompanyController> _logger;

        private readonly IUnitOfWork _unitOfWork;

        public CompanyController(
            IConfiguration config,
            ILogger<CompanyController> logger,
            IUnitOfWork unitOfWork
            )
        {
            _config = config;
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        [Route("active")]
        public async Task<IPagedList<Company>> GetActives() =>
            await _unitOfWork.GetRepository<Company>().GetPagedListAsync(predicate: c => c.RecordState == RecordState.Active);


        [HttpPost]
        [Route("search-model")]
        public async Task<IPagedList<CompanyDto>> SearchWithModel([FromBody] CompanySearchDto model)
        {
            try
            {
                var result = await _unitOfWork.GetRepository<Company>().GetPagedListAsync(
                     x => new CompanyDto
                     {
                         Id = x.Id,
                         Name = x.Name,
                         DnsName = x.DnsName,
                         TelephoneNo = x.TelephoneNo,
                         HostName = x.HostName,
                         DataBase = x.DataBase,
                         Environment = x.Environment,
                         DomainName = x.DomainName,
                         Address = x.Address,
                         EmailAddress = x.EmailAddress,
                         CreatedOn = x.CreatedOn,
                         RecordState = x.RecordState,
                         ContactPerson = x.ContactPerson
                     }
                     , predicate: t => (
                                          (model.Name == null || t.Name.Contains(model.Name)) &&
                                          (model.DnsName == null || t.DnsName.Contains(model.DnsName)) &&
                                          (model.TelephoneNo == null || t.TelephoneNo.Contains(model.TelephoneNo)) &&
                                          (model.ContactPerson == null || t.ContactPerson.Contains(model.ContactPerson))
                                       )

                     , pageIndex: model.PageIndex, pageSize: model.PageSize
                     , orderBy: source => source.OrderBy(o => o.RecordState)

                     );

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Search Error : {ex.Message}");
                throw;
            }
        }


        [HttpGet]
        [Route("getById/{id}")]
        public async Task<Company> GetById(Guid id)
        {
            var data = await _unitOfWork.GetRepository<Company>().FindAsync(id);
            return data;
        }

        [HttpPost]
        [Route("post")]
        public async Task<IActionResult> Post([FromBody] CreateCompanyDto model)
        {
            try
            {
                var checkIfExist = await _unitOfWork.GetRepository<Company>().GetFirstOrDefaultAsync(predicate: p => p.Name.Equals(model.Name));
                if (checkIfExist != null)
                {
                    _logger.LogInformation($"Company Name : {model.Name} already exists!");
                    throw new InvalidOperationException($"Company Name : {model.Name} already exists!");
                }
                var value = new Company
                {
                    Name = model.Name,
                    HostName = model.HostName,
                    EmailAddress = model.EmailAddress,
                    DomainName = model.DomainName,
                    DnsName = model.DnsName,
                    DataBase = model.DataBase,
                    TelephoneNo = model.TelephoneNo,
                    ContactPerson = model.ContactPerson,
                    Address = model.Address,
                    Environment = model.Environment  //string.Join(",", model.Environment)
                };

                var repo = _unitOfWork.GetRepository<Company>();
                repo.Insert(value);

                var success = await _unitOfWork.SaveChangesAsync(ensureAutoHistory: true) > 0;

                return Ok(new { id = value.Id, Success = success, MessageCode = 0, Message = string.Empty });
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Company-INSERT-ERROR : {ex.Message}");
                return BadRequest(new { Success = false, MessageCode = 0, Message = ex.Message });
            }
        }

        [HttpPut]
        [Route("put/{id}")]
        public async Task<IActionResult> Put([FromBody] CreateCompanyDto value, Guid id)
        {
            try
            {
                var success = false;
                var repo = await _unitOfWork.GetRepository<Company>().FindAsync(id);
                if (repo != null)
                {
                    repo.Name = value.Name;
                    repo.TelephoneNo = value.TelephoneNo;
                    repo.EmailAddress = value.EmailAddress;
                    repo.DnsName = value.DnsName;
                    repo.DomainName = value.DomainName;
                    repo.HostName = value.HostName;
                    repo.Environment = value.Environment; // string.Join(",", value.Environment);
                    repo.Address = value.Address;
                    repo.ContactPerson = value.ContactPerson;

                    success = await _unitOfWork.SaveChangesAsync() > 0;

                }
                return Ok(new { id = id, Success = success, MessageCode = 0, Message = string.Empty });
            }

            catch (Exception ex)
            {
                _logger.LogInformation($"Company-UPDATE-ERROR : {ex.Message}");
                return BadRequest(new { id = id, Success = false, MessageCode = 0, Message = ex.Message });
            }
        }

        [HttpPut]
        [Route("delete/{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            try
            {
                var success = false;
                var repo = await _unitOfWork.GetRepository<Company>().FindAsync(id);
                if (repo != null)
                {
                    repo.RecordState = RecordState.Deleted;
                    success = await _unitOfWork.SaveChangesAsync() > 0;
                }
                return Ok(new { id, Success = success, MessageCode = 0, Message = string.Empty });
            }

            catch (Exception ex)
            {
                _logger.LogInformation($"Company-DELETE-ERROR : {ex.Message}");
                return BadRequest(new { id, Success = false, MessageCode = 0, Message = ex.Message });
            }
        }

    }
}
